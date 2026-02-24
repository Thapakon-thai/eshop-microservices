package models

import "time"

type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "PENDING"
	PaymentStatusCompleted PaymentStatus = "COMPLETED"
	PaymentStatusFailed    PaymentStatus = "FAILED"
	PaymentStatusCancelled PaymentStatus = "CANCELLED"
)

type Payment struct {
	ID        string        `json:"id" db:"id"`
	OrderID   string        `json:"order_id" db:"order_id"`
	UserID    string        `json:"user_id" db:"user_id"`
	FullName  string        `json:"full_name" db:"full_name"`
	Email     string        `json:"email" db:"email"`
	Amount    float64       `json:"amount" db:"amount"`
	Status    PaymentStatus `json:"status" db:"status"`
	CreatedAt time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt time.Time     `json:"updated_at" db:"updated_at"`
}
