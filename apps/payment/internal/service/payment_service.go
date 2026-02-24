package service

import (
	"context"
	"fmt"
	"time"

	"github.com/thapakon-thai/eshop-microservices/payment/internal/models"
)

type paymentServiceImpl struct {
	repo PaymentRepository
}

func NewPaymentService(repo PaymentRepository) PaymentService {
	return &paymentServiceImpl{repo: repo}
}

func (s *paymentServiceImpl) ProcessPayment(ctx context.Context, orderID, userID, fullName, email string, amount int64) (*models.Payment, error) {
	payment := &models.Payment{
		ID:        fmt.Sprintf("PAY-%d", time.Now().UnixNano()),
		OrderID:   orderID,
		UserID:    userID,
		FullName:  fullName,
		Email:     email,
		Amount:    amount, // In Cents
		Status:    models.PaymentStatusPending,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := payment.Validate(); err != nil {
		return nil, err
	}

	if err := s.repo.CreatePayment(ctx, payment); err != nil {
		return nil, fmt.Errorf("failed to create payment record: %w", err)
	}

	// Mocking payment processing
	// In a real scenario, this would call a payment gateway (Stripe, Omise, etc.)
	time.Sleep(100 * time.Millisecond)

	payment.Status = models.PaymentStatusCompleted
	payment.UpdatedAt = time.Now()

	if err := s.repo.UpdatePaymentStatus(ctx, payment.ID, payment.Status); err != nil {
		return nil, fmt.Errorf("failed to update payment status: %w", err)
	}

	return payment, nil
}

func (s *paymentServiceImpl) GetPaymentByID(ctx context.Context, id string) (*models.Payment, error) {
	if id == "" {
		return nil, fmt.Errorf("invalid payment id")
	}
	return s.repo.GetPaymentByID(ctx, id)
}

func (s *paymentServiceImpl) GetUserPayments(ctx context.Context, userID string) ([]*models.Payment, error) {
	if userID == "" {
		return nil, fmt.Errorf("invalid user id")
	}
	return s.repo.GetPaymentsByUserID(ctx, userID)
}
