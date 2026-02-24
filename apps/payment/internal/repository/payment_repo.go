package repository

import (
	"context"

	"github.com/thapakon-thai/eshop-microservices/payment/internal/models"
	"gorm.io/gorm"
)

type PaymentRepository interface {
	CreatePayment(ctx context.Context, payment *models.Payment) error
	GetPaymentByID(ctx context.Context, id string) (*models.Payment, error)
	GetPaymentsByUserID(ctx context.Context, userID string) ([]*models.Payment, error)
	UpdatePaymentStatus(ctx context.Context, id string, status models.PaymentStatus) error
}

type postgresPaymentRepository struct {
	db *gorm.DB
}

func NewPostgresRepository(db *gorm.DB) PaymentRepository {
	return &postgresPaymentRepository{db: db}
}

func (r *postgresPaymentRepository) CreatePayment(ctx context.Context, payment *models.Payment) error {
	return r.db.WithContext(ctx).Create(payment).Error
}

func (r *postgresPaymentRepository) GetPaymentByID(ctx context.Context, id string) (*models.Payment, error) {
	var payment models.Payment
	if err := r.db.WithContext(ctx).First(&payment, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &payment, nil
}

func (r *postgresPaymentRepository) GetPaymentsByUserID(ctx context.Context, userID string) ([]*models.Payment, error) {
	var payments []*models.Payment
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&payments).Error; err != nil {
		return nil, err
	}
	return payments, nil
}

func (r *postgresPaymentRepository) UpdatePaymentStatus(ctx context.Context, id string, status models.PaymentStatus) error {
	return r.db.WithContext(ctx).Model(&models.Payment{}).Where("id = ?", id).Update("status", status).Error
}

