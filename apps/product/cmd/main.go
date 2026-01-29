package main

import (
	"context"
	"fmt"
	"log/slog"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/thapakon-thai/eshop-microservices/product/internal/config"
	"github.com/thapakon-thai/eshop-microservices/product/internal/handler"
	"github.com/thapakon-thai/eshop-microservices/product/internal/infrastructure/db"
	"github.com/thapakon-thai/eshop-microservices/product/internal/repository"
	"github.com/thapakon-thai/eshop-microservices/product/internal/service"
	pb "github.com/thapakon-thai/eshop-microservices/proto/product"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	cfg := config.LoadConfig()

	// Database
	mongoClient, err := db.NewMongoDB(cfg.MongoDBURI)
	if err != nil {
		slog.Error("Failed to connect to MongoDB", "error", err)
		os.Exit(1)
	}
	defer func() {
		if err := mongoClient.Disconnect(context.Background()); err != nil {
			slog.Error("Error disconnecting from MongoDB", "error", err)
		}
	}()
	database := mongoClient.Database(cfg.DBName)

	// Layers (Dependency Injection)
	repo := repository.NewMongoRepository(database)
	svc := service.NewProductService(repo)
	grpcHandler := handler.NewProductGrpcHandler(svc)

	// GRPC Server
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", cfg.ServicePort))
	if err != nil {
		slog.Error("Failed to listen", "error", err)
		os.Exit(1)
	}

	s := grpc.NewServer()
	pb.RegisterProductServiceServer(s, grpcHandler)
	reflection.Register(s) // for debugging

	go func() {
		slog.Info("Starting gRPC server", "port", cfg.ServicePort)
		// s.Serve is blocking call so I use go routine to run it in background
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
