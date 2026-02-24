package service

import (
	"context"
	"fmt"

	"github.com/thapakon-thai/eshop-microservices/inventory/internal/models"
)

type InventoryServiceImpl struct {
	repo InventoryRepository
}

func NewInventoryService(repo InventoryRepository) InventoryService {
	return &InventoryServiceImpl{repo: repo}
}

func (s *InventoryServiceImpl) GetStock(ctx context.Context, productID string) (*models.Inventory, error) {
	if productID == "" {
		return nil, fmt.Errorf("invalid product ID")
	}
	return s.repo.GetStock(ctx, productID)
}

func (s *InventoryServiceImpl) UpdateStock(ctx context.Context, productID string, change int32) (*models.Inventory, error) {
	if productID == "" {
		return nil, fmt.Errorf("invalid product ID")
	}

	// Repository handles atomic checks on stock dropping below zero.
	return s.repo.UpdateStock(ctx, productID, change)
}
