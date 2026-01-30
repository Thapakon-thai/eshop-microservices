package service

import (
	"context"

	"github.com/thapakon-thai/eshop-microservices/product/internal/models"
	"github.com/thapakon-thai/eshop-microservices/product/internal/repository"
)

type ProductService struct {
	repo repository.ProductRepository
}

func NewProductService(repo repository.ProductRepository) *ProductService {
	return &ProductService{repo: repo}
}

func (s *ProductService) CreateProduct(ctx context.Context, product *models.Product) error {
	return s.repo.Create(ctx, product)
}

func (s *ProductService) GetProduct(ctx context.Context, id string) (*models.Product, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *ProductService) ListProducts(ctx context.Context, page, limit int32, categoryID string) ([]*models.Product, int64, error) {
	return s.repo.FindAll(ctx, page, limit, categoryID)
}

func (s *ProductService) DeleteProduct(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
