package service

import (
	"context"
	"github.com/thapakon-thai/eshop-microservices/order-service/internal/models"
	"github.com/thapakon-thai/eshop-microservices/order-service/internal/repository"
)

type OrderService interface {
	CreateOrder(ctx context.Context, order *models.CreateOrderRequest) (*models.Order, error) 
	GetOrders(ctx context.Context) (*models.Order, error)
}

type OrderServiceImpl struct {
	repo repository.OrderRepo
}

// constructor
func NewOrderService(repo repository.OrderRepo) *OrderServiceImpl {
	return &OrderServiceImpl{repo: repo}
}

func (s *OrderServiceImpl) CreateOrder(ctx context.Context, order *models.Order) error {
	// create order's logic here

	// save to db
	// orderId, err := s.repo.CreateOrder(ctx, order)

	return nil
}

func (s *OrderServiceImpl) GetOrders(ctx context.Context, id string) (*models.Order, error) {
	return s.repo.GetOrders(ctx, id)
}