package service

import (
	"context"

	"github.com/thapakon-thai/eshop-microservices/order/internal/models"
)

// OrderService is the Primary Port (Driving Port) that external APIs use.
type OrderService interface {
	CreateOrder(ctx context.Context, req *models.CreateOrderRequest) (*models.Order, error)
	GetOrders(ctx context.Context, id string) (*models.Order, error)
	ListOrders(ctx context.Context) ([]*models.Order, error)
}

// OrderRepository is a Secondary Port (Driven Port) for the Database.
type OrderRepository interface {
	CreateOrder(ctx context.Context, order *models.Order) error
	GetOrders(ctx context.Context, id string) (*models.Order, error)
	ListOrders(ctx context.Context) ([]*models.Order, error)
}

// Product representation for the Application / Domain Layer
type Product struct {
	ID    string
	Price float64
}

// ProductServiceClient is a Secondary Port for communicating with the Product Service.
type ProductServiceClient interface {
	GetProduct(ctx context.Context, id string) (*Product, error)
}

// InventoryServiceClient is a Secondary Port for communicating with the Inventory Service.
type InventoryServiceClient interface {
	CheckStock(ctx context.Context, productID string) (int32, error)
	DeductStock(ctx context.Context, productID string, quantity int32) error
}

// OrderEventPublisher is a Secondary Port for publishing order events to the Message Broker.
type OrderEventPublisher interface {
	PublishOrderCreated(order *models.Order) error
}
