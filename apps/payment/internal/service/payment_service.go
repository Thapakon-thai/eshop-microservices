package service

import (
	"context"
	"fmt"
	"time"

	"github.com/thapakon-thai/eshop-microservices/payment/internal/models"
	"github.com/thapakon-thai/eshop-microservices/payment/internal/repository"
)

type PaymentService interface {
	ProcessPayment(ctx context.Context, orderID, userID, fullName, email string, amount float64) (*models.Payment, error)
	GetPaymentByID(ctx context.Context, id string) (*models.Payment, error)
	GetUserPayments(ctx context.Context, userID string) ([]*models.Payment, error)
}

type paymentService struct {
	repo repository.PaymentRepository
}

func NewPaymentService(repo repository.PaymentRepository) PaymentService {
	return &paymentService{repo: repo}
}

func (s *paymentService) ProcessPayment(ctx context.Context, orderID, userID, fullName, email string, amount float64) (*models.Payment, error) {
	payment := &models.Payment{
		ID:        fmt.Sprintf("PAY-%d", time.Now().UnixNano()),
		OrderID:   orderID,
		UserID:    userID,
		FullName:  fullName,
		Email:     email,
		Amount:    amount,
		Status:    models.PaymentStatusPending,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.repo.CreatePayment(ctx, payment); err != nil {
		return nil, err
	}

	// Mocking payment processing
	// In a real scenario, this would call a payment gateway (Stripe, Omise, etc.)
	time.Sleep(100 * time.Millisecond)
	
	payment.Status = models.PaymentStatusCompleted
	payment.UpdatedAt = time.Now()
	
	if err := s.repo.UpdatePaymentStatus(ctx, payment.ID, payment.Status); err != nil {
		return nil, err
	}

	return payment, nil
}

func (s *paymentService) GetPaymentByID(ctx context.Context, id string) (*models.Payment, error) {
	return s.repo.GetPaymentByID(ctx, id)
}

func (s *paymentService) GetUserPayments(ctx context.Context, userID string) ([]*models.Payment, error) {
	return s.repo.GetPaymentsByUserID(ctx, userID)
}

