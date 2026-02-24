package service

import (
	"context"

	"github.com/thapakon-thai/eshop-microservices/payment/internal/models"
)

// PaymentService is the Primary Port.
type PaymentService interface {
	ProcessPayment(ctx context.Context, orderID, userID, fullName, email string, amount int64) (*models.Payment, error)
	GetPaymentByID(ctx context.Context, id string) (*models.Payment, error)
	GetUserPayments(ctx context.Context, userID string) ([]*models.Payment, error)
	ListAllPayments(ctx context.Context) ([]*models.Payment, error)
}

// PaymentRepository is the Secondary Port for the Database.
type PaymentRepository interface {
	CreatePayment(ctx context.Context, payment *models.Payment) error
	GetPaymentByID(ctx context.Context, id string) (*models.Payment, error)
	GetPaymentsByUserID(ctx context.Context, userID string) ([]*models.Payment, error)
	ListAllPayments(ctx context.Context) ([]*models.Payment, error)
	UpdatePaymentStatus(ctx context.Context, id string, status models.PaymentStatus) error
}
