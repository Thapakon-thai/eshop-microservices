package service

import (
	"context"
	"fmt"

	"github.com/thapakon-thai/eshop-microservices/product/internal/models"
)

type ProductServiceImpl struct {
	repo ProductRepository
}

func NewProductService(repo ProductRepository) ProductService {
	return &ProductServiceImpl{repo: repo}
}

func (s *ProductServiceImpl) CreateProduct(ctx context.Context, product *models.Product) error {
	if err := product.Validate(); err != nil {
		return err
	}
	if err := s.repo.Create(ctx, product); err != nil {
		return fmt.Errorf("failed to create product: %w", err)
	}
	return nil
}

func (s *ProductServiceImpl) GetProduct(ctx context.Context, id string) (*models.Product, error) {
	product, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get product: %w", err)
	}
	return product, nil
}

func (s *ProductServiceImpl) ListProducts(ctx context.Context, page, limit int32, categoryID string) ([]*models.Product, int64, error) {
	products, total, err := s.repo.FindAll(ctx, page, limit, categoryID)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list products: %w", err)
	}
	return products, total, nil
}

func (s *ProductServiceImpl) DeleteProduct(ctx context.Context, id string) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}
	return nil
}
