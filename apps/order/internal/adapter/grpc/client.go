package grpc

import (
	"context"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/status"

	"github.com/thapakon-thai/eshop-microservices/order/internal/service"
	invPb "github.com/thapakon-thai/eshop-microservices/proto/inventory"
	pb "github.com/thapakon-thai/eshop-microservices/proto/product"
)

type productGrpcClient struct {
	client pb.ProductServiceClient
}

// NewProductGrpcClient returns a new gRPC client mapped to the ProductServiceClient port.
func NewProductGrpcClient(url string) (service.ProductServiceClient, error) {
	conn, err := grpc.NewClient(url, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	return &productGrpcClient{client: pb.NewProductServiceClient(conn)}, nil
}

func (c *productGrpcClient) GetProduct(ctx context.Context, id string) (*service.Product, error) {
	res, err := c.client.GetProduct(ctx, &pb.GetProductRequest{Id: id})
	if err != nil {
		if st, ok := status.FromError(err); ok && st.Code() == codes.NotFound {
			return nil, service.ErrProductNotFound
		}
		return nil, err
	}
	// Map Proto response to Domain struct
	return &service.Product{
		ID:    res.Id,
		Price: res.Price,
	}, nil
}

type inventoryGrpcClient struct {
	client invPb.InventoryServiceClient
}

// NewInventoryGrpcClient returns a new gRPC client mapped to the InventoryServiceClient port.
func NewInventoryGrpcClient(url string) (service.InventoryServiceClient, error) {
	conn, err := grpc.NewClient(url, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	return &inventoryGrpcClient{client: invPb.NewInventoryServiceClient(conn)}, nil
}

func (c *inventoryGrpcClient) CheckStock(ctx context.Context, productID string) (int32, error) {
	res, err := c.client.GetStock(ctx, &invPb.GetStockRequest{ProductId: productID})
	if err != nil {
		if st, ok := status.FromError(err); ok && st.Code() == codes.NotFound {
			return 0, service.ErrProductNotFound
		}
		return 0, err
	}
	// Map Proto response to Domain concept (quantity)
	return res.Quantity, nil
}

func (c *inventoryGrpcClient) DeductStock(ctx context.Context, productID string, quantity int32) error {
	_, err := c.client.UpdateStock(ctx, &invPb.UpdateStockRequest{
		ProductId:      productID,
		QuantityChange: -quantity,
	})
	if err != nil {
		return err
	}
	return nil
}
