package service

import (
	"context"

	"github.com/thapakon-thai/eshop-microservices/inventory/internal/models"
)

// InventoryService is the Primary Port.
type InventoryService interface {
	GetStock(ctx context.Context, productID string) (*models.Inventory, error)
	UpdateStock(ctx context.Context, productID string, change int32) (*models.Inventory, error)
}

// InventoryRepository is the Secondary Port for the Database.
type InventoryRepository interface {
	GetStock(ctx context.Context, productID string) (*models.Inventory, error)
	UpdateStock(ctx context.Context, productID string, change int32) (*models.Inventory, error)
}
