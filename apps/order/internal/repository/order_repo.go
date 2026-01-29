package repository

import (
	"context"

	"github.com/thapakon-thai/eshop-microservices/order/internal/models"
	"gorm.io/gorm"
)

type OrderRepo interface {
	CreateOrder(ctx context.Context, order *models.Order) error
	GetOrders(ctx context.Context, id string) (*models.Order, error)
	ListOrders(ctx context.Context) ([]*models.Order, error)
}

type PostgresqlOrderRepo struct {
	db *gorm.DB
}

// constructor
func NewPostgresqlRepo(db *gorm.DB) *PostgresqlOrderRepo {
	return &PostgresqlOrderRepo{db: db}
}

func (r *PostgresqlOrderRepo) CreateOrder(ctx context.Context, order *models.Order) error {
	return r.db.WithContext(ctx).Create(order).Error
}

func (r *PostgresqlOrderRepo) GetOrders(ctx context.Context, id string) (*models.Order, error) {
	var order models.Order
	if err := r.db.WithContext(ctx).Preload("Items").First(&order, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *PostgresqlOrderRepo) ListOrders(ctx context.Context) ([]*models.Order, error) {
	var orders []*models.Order
	if err := r.db.WithContext(ctx).Preload("Items").Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}
