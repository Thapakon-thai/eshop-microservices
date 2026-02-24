package main

import (
	"log/slog"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"github.com/thapakon-thai/eshop-microservices/order/internal/adapter/broker"
	"github.com/thapakon-thai/eshop-microservices/order/internal/adapter/db"
	"github.com/thapakon-thai/eshop-microservices/order/internal/adapter/grpc"
	"github.com/thapakon-thai/eshop-microservices/order/internal/adapter/repository"
	"github.com/thapakon-thai/eshop-microservices/order/internal/handler"
	"github.com/thapakon-thai/eshop-microservices/order/internal/service"
)

func main() {
	logHandler := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logHandler)

	port := os.Getenv("ORDER_SERVICE_PORT")
	if port == "" {
		port = "8002"
	}

	dbDsn := os.Getenv("DB_DSN")
	if dbDsn == "" {
		slog.Error("DB_DSN environment variable is not set")
		os.Exit(1)
	}

	// Initialize database
	gormDB, err := db.NewPostgres(dbDsn)
	if err != nil {
		slog.Error("Failed to connect to database", "error", err)
		os.Exit(1)
	}

	// Migrate database schema
	if err := gormDB.AutoMigrate(&repository.OrderDBModel{}, &repository.OrderItemDBModel{}); err != nil {
		slog.Error("Failed to migrate database schema", "error", err)
		os.Exit(1)
	}

	// Dependency Injection Setup

	productUrl := os.Getenv("PRODUCT_SERVICE_URL")
	if productUrl == "" {
		productUrl = "product-service:5004"
	}
	inventoryUrl := os.Getenv("INVENTORY_SERVICE_URL")
	if inventoryUrl == "" {
		inventoryUrl = "inventory-service:5005"
	}

	// 1. Initialize Secondary Adapters
	repo := repository.NewPostgresqlRepo(gormDB)

	productClient, err := grpc.NewProductGrpcClient(productUrl)
	if err != nil {
		slog.Error("Failed to initialize product grpc client", "error", err)
		os.Exit(1)
	}

	inventoryClient, err := grpc.NewInventoryGrpcClient(inventoryUrl)
	if err != nil {
		slog.Error("Failed to initialize inventory grpc client", "error", err)
		os.Exit(1)
	}

	rabbitMQUrl := os.Getenv("RABBITMQ_URL")
	publisher, cleanupRabbitMQ, err := broker.NewRabbitMQPublisher(rabbitMQUrl)
	if err != nil {
		slog.Error("Failed to initialize rabbitmq publisher", "error", err)
		os.Exit(1)
	}
	defer cleanupRabbitMQ()

	// 2. Initialize Service Node (Injecting Secondary Ports)
	svc := service.NewOrderService(repo, productClient, inventoryClient, publisher)

	// 3. Initialize Primary Adapter (Injecting Primary Port)
	h := handler.NewOrderHandler(svc)

	// Fiber Implementation
	app := fiber.New(fiber.Config{
		AppName: "Order Service",
	})

	// Middlewares
	app.Use(logger.New())
	app.Use(recover.New())

	// Routes
	handler.RegisterRoutes(app, h)

	slog.Info("Starting server at", "port", ":"+port)
	if err := app.Listen(":" + port); err != nil {
		slog.Error("Server failed", "error", err)
		os.Exit(1)
	}
}
