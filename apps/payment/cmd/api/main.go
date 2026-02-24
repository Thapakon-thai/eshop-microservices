package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/thapakon-thai/eshop-microservices/payment/internal/adapter/repository"
	"github.com/thapakon-thai/eshop-microservices/payment/internal/handler"
	"github.com/thapakon-thai/eshop-microservices/payment/internal/infrastructure/db"
	"github.com/thapakon-thai/eshop-microservices/payment/internal/service"
)

func main() {
	// Configuration
	dbURL := os.Getenv("SPRING_DATASOURCE_URL")
	if dbURL == "" {
		dbHost := os.Getenv("DB_HOST")
		dbPort := os.Getenv("DB_PORT")
		dbUser := os.Getenv("DB_USER")
		dbPass := os.Getenv("DB_PASSWORD")
		dbName := os.Getenv("PAYMENT_DB_NAME")
		dbURL = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", dbUser, dbPass, dbHost, dbPort, dbName)
	}

	// Database Initialization
	database, err := db.NewPostgres(dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto Migration mapped against DB Model (Adapter specific)
	if err := database.AutoMigrate(&repository.PaymentDBModel{}); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Layers Initialization
	repo := repository.NewPostgresRepository(database)
	svc := service.NewPaymentService(repo)
	h := handler.NewPaymentHandler(svc)

	// Fiber Implementation
	app := fiber.New(fiber.Config{
		AppName: "Payment Service (Fiber)",
	})

	// Middlewares
	app.Use(logger.New())
	app.Use(recover.New())

	// Routes
	handler.RegisterRoutes(app, h)

	// Server setup
	port := os.Getenv("PAYMENT_SERVICE_PORT")
	if port == "" {
		port = "5003"
	}

	log.Printf("Payment Service (Fiber) starting on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
