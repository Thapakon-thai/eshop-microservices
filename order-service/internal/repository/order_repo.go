package repository

import (
	"context"
	"gorm.io/gorm"
	"github.com/thapakon-thai/eshop-microservices/order-service/internal/models"
)

type OrderRepo interface {
	CreateOrder(ctx context.Context, order *models.Order) error
	GetOrders(ctx context.Context, id string) (*models.Order, error)
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
	if err := r.db.WithContext(ctx).First(&order, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &order, nil
}