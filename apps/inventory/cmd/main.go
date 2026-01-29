package main

import (
	"fmt"
	"log/slog"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/thapakon-thai/eshop-microservices/inventory/internal/handler"
	"github.com/thapakon-thai/eshop-microservices/inventory/internal/infrastructure/db"
	"github.com/thapakon-thai/eshop-microservices/inventory/internal/models"
	"github.com/thapakon-thai/eshop-microservices/inventory/internal/repository"
	"github.com/thapakon-thai/eshop-microservices/inventory/internal/service"
	pb "github.com/thapakon-thai/eshop-microservices/proto/inventory"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	port := os.Getenv("INVENTORY_SERVICE_PORT")
	if port == "" {
		port = "5005"
	}

	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		slog.Error("DB_DSN environment variable is not set")
		os.Exit(1)
	}

	// Database
	gormDB, err := db.NewPostgres(dsn)
	if err != nil {
		slog.Error("Failed to connect to database", "error", err)
		os.Exit(1)
	}

	// Auto Migrate
	if err := gormDB.AutoMigrate(&models.Inventory{}); err != nil {
		slog.Error("Failed to migrate database", "error", err)
		os.Exit(1)
	}

	// Layers
	repo := repository.NewPostgresRepository(gormDB)
	svc := service.NewInventoryService(repo)
	grpcHandler := handler.NewInventoryGrpcHandler(svc)

	// GRPC Server
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
	if err != nil {
		slog.Error("Failed to listen", "error", err)
		os.Exit(1)
	}

	s := grpc.NewServer()
	pb.RegisterInventoryServiceServer(s, grpcHandler)
	reflection.Register(s)

	go func() {
		slog.Info("Starting Inventory gRPC server", "port", port)
		if err := s.Serve(lis); err != nil {
			slog.Error("Failed to serve gRPC", "error", err)
			os.Exit(1)
		}
	}()

	// Wait for interrupt
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("Shutting down server...")
	s.GracefulStop()
	slog.Info("Server exited")
}
