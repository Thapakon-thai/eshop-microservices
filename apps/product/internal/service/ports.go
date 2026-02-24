package service

import (
	"context"

	"github.com/thapakon-thai/eshop-microservices/product/internal/models"
)

// ProductService is the Primary Port.
type ProductService interface {
	CreateProduct(ctx context.Context, product *models.Product) error
	GetProduct(ctx context.Context, id string) (*models.Product, error)
	ListProducts(ctx context.Context, page, limit int32, categoryID string) ([]*models.Product, int64, error)
	DeleteProduct(ctx context.Context, id string) error
}

// ProductRepository is the Secondary Port for the Database.
type ProductRepository interface {
	Create(ctx context.Context, product *models.Product) error
	FindByID(ctx context.Context, id string) (*models.Product, error)
	FindAll(ctx context.Context, page, limit int32, categoryID string) ([]*models.Product, int64, error)
	Delete(ctx context.Context, id string) error
}
