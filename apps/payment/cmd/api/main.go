package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/thapakon-thai/eshop-microservices/payment/internal/handler"
	"github.com/thapakon-thai/eshop-microservices/payment/internal/infrastructure/db"
	"github.com/thapakon-thai/eshop-microservices/payment/internal/models"
	"github.com/thapakon-thai/eshop-microservices/payment/internal/repository"
	"github.com/thapakon-thai/eshop-microservices/payment/internal/service"
)

func main() {
	// Configuration
	dbURL := os.Getenv("SPRING_DATASOURCE_URL") // Keeping original env name for compatibility
	if dbURL == "" {
		// Fallback to components
		dbHost := os.Getenv("DB_HOST")
		dbPort := os.Getenv("DB_PORT")
		dbUser := os.Getenv("DB_USER")
		dbPass := os.Getenv("DB_PASSWORD")
		dbName := os.Getenv("PAYMENT_DB_NAME")
		dbURL = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", dbUser, dbPass, dbHost, dbPort, dbName)
	} else {
		// Convert jdbc:postgresql to postgresql://
		// jdbc:postgresql://localhost:5432/payment_db -> postgresql://localhost:5432/payment_db
		// In a real scenario, we might need more complex parsing
	}

	// Database Initialization
	database, err := db.NewPostgres(dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto Migration
	database.AutoMigrate(&models.Payment{})

	// Layers Initialization
	repo := repository.NewPostgresRepository(database)
	svc := service.NewPaymentService(repo)
	h := handler.NewPaymentHandler(svc)

	// Routing
	r := handler.Route(h)

	// Server setup
	port := os.Getenv("PAYMENT_SERVICE_PORT")
	if port == "" {
		port = "5003"
	}

	log.Printf("Payment Service starting on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

