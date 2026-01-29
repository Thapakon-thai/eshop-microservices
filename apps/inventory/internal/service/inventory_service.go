package service

import (
	"context"

	"github.com/thapakon-thai/eshop-microservices/inventory/internal/models"
	"github.com/thapakon-thai/eshop-microservices/inventory/internal/repository"
)

type InventoryService struct {
	repo repository.InventoryRepository
}

func NewInventoryService(repo repository.InventoryRepository) *InventoryService {
	return &InventoryService{repo: repo}
}

func (s *InventoryService) GetStock(ctx context.Context, productID string) (*models.Inventory, error) {
	return s.repo.GetStock(ctx, productID)
}

func (s *InventoryService) UpdateStock(ctx context.Context, productID string, change int32) (*models.Inventory, error) {
	return s.repo.UpdateStock(ctx, productID, change)
}
