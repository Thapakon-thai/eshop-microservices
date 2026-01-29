package handler

import (
	"context"
	"log/slog"

	"github.com/thapakon-thai/eshop-microservices/inventory/internal/service"
	pb "github.com/thapakon-thai/eshop-microservices/proto/inventory"
)

type InventoryGrpcHandler struct {
	pb.UnimplementedInventoryServiceServer
	svc *service.InventoryService
}

func NewInventoryGrpcHandler(svc *service.InventoryService) *InventoryGrpcHandler {
	return &InventoryGrpcHandler{svc: svc}
}

func (h *InventoryGrpcHandler) GetStock(ctx context.Context, req *pb.GetStockRequest) (*pb.GetStockResponse, error) {
	inv, err := h.svc.GetStock(ctx, req.ProductId)
	if err != nil {
		slog.Warn("Product not found in inventory, returning 0", "product_id", req.ProductId)
		return &pb.GetStockResponse{ProductId: req.ProductId, Quantity: 0}, nil
	}
	return &pb.GetStockResponse{ProductId: req.ProductId, Quantity: inv.Quantity}, nil
}

func (h *InventoryGrpcHandler) UpdateStock(ctx context.Context, req *pb.UpdateStockRequest) (*pb.UpdateStockResponse, error) {
	inv, err := h.svc.UpdateStock(ctx, req.ProductId, req.QuantityChange)
	if err != nil {
		return &pb.UpdateStockResponse{Success: false, Message: err.Error()}, nil
	}
	return &pb.UpdateStockResponse{Success: true, NewQuantity: inv.Quantity}, nil
}
