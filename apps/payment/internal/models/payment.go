package models

import (
	"errors"
	"time"
)

type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "PENDING"
	PaymentStatusCompleted PaymentStatus = "COMPLETED"
	PaymentStatusFailed    PaymentStatus = "FAILED"
	PaymentStatusCancelled PaymentStatus = "CANCELLED"
)

// Payment represents the pristine domain model structurally ignorant of GORM or REST formatting.
type Payment struct {
	ID        string
	OrderID   string
	UserID    string
	FullName  string
	Email     string
	Amount    int64 // Stored in Cents (e.g. 1000 = $10.00)
	Status    PaymentStatus
	CreatedAt time.Time
	UpdatedAt time.Time
}

// Validate ensures structural Domain bounds.
func (p *Payment) Validate() error {
	if p.OrderID == "" {
		return errors.New("order ID cannot be empty")
	}
	if p.UserID == "" {
		return errors.New("user ID cannot be empty")
	}
	if p.Amount <= 0 {
		return errors.New("payment amount must be greater than zero")
	}
	return nil
}
