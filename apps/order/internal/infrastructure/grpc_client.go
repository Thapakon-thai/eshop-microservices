package infrastructure

import (
	"log"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	invPb "github.com/thapakon-thai/eshop-microservices/proto/inventory"
	pb "github.com/thapakon-thai/eshop-microservices/proto/product"
)

type GrpcClients struct {
	ProductClient   pb.ProductServiceClient
	InventoryClient invPb.InventoryServiceClient
}

func NewGrpcClients(productUrl, inventoryUrl string) *GrpcClients {
	productConn, err := grpc.NewClient(productUrl, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect to product service: %v", err)
	}

	inventoryConn, err := grpc.NewClient(inventoryUrl, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect to inventory service: %v", err)
	}

	return &GrpcClients{
		ProductClient:   pb.NewProductServiceClient(productConn),
		InventoryClient: invPb.NewInventoryServiceClient(inventoryConn),
	}
}
