package service

import (
	"context"

	"github.com/thapakon-thai/eshop-microservices/inventory/internal/models"
)

type InventoryService interface {
	GetStock(ctx context.Context, productID string) (*models.Inventory, error)
	UpdateStock(ctx context.Context, productID string, change int32) (*models.Inventory, error)
}

type InventoryRepository interface {
	GetStock(ctx context.Context, productID string) (*models.Inventory, error)
	UpdateStock(ctx context.Context, productID string, change int32) (*models.Inventory, error)
}
