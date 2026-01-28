package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/thapakon-thai/eshop-microservices/order/internal/handler"
	"github.com/thapakon-thai/eshop-microservices/order/internal/infrastructure/db"
	"github.com/thapakon-thai/eshop-microservices/order/internal/models"
	"github.com/thapakon-thai/eshop-microservices/order/internal/repository"
	"github.com/thapakon-thai/eshop-microservices/order/internal/service"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

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
	if err := gormDB.AutoMigrate(&models.Order{}, &models.OrderItem{}); err != nil {
		slog.Error("Failed to migrate database schema", "error", err)
		os.Exit(1)
	}

	// Dependency Injection
	repo := repository.NewPostgresqlRepo(gormDB)
	svc := service.NewOrderService(repo)
	h := handler.NewOrderHandler(svc)

	// Router
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Mount("/api/v1/", handler.Route(h))

	slog.Info("Starting server at", "port", ":"+port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		slog.Error("Server failed", "error", err)
		os.Exit(1)
	}

}