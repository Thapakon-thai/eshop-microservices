package models

import (
	"time"
	"github.com/shopspring/decimal"
)

type Order struct {
	ID          int64       `json:"id" gorm:"primaryKey"`
	UserID      string      `json:"user_id"`
	TotalAmount float64     `json:"total_amount"`
	Status      string      `json:"status"` // e.g., "pending", "paid", "shipped"
	CreatedAt   time.Time   `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time   `json:"updated_at" gorm:"autoUpdateTime"`
	Items       []OrderItem `json:"items,omitempty" gorm:"foreignKey:OrderID"`
}

type OrderItem struct {
	ID        int64   `json:"id" gorm:"primaryKey"`
	OrderID   int64   `json:"order_id"`
	ProductID string  `json:"product_id"`
	Quantity  int     `json:"quantity"`
	Price     decimal.Decimal `json:"price"`
}

type CreateOrderRequest struct {
	UserID string            `json:"user_id"`
	Items  []CreateOrderItem `json:"items"`
}

type CreateOrderItem struct {
	ProductID string  `json:"product_id"`
	Quantity  int     `json:"quantity"`
	Price     decimal.Decimal `json:"price"`
}
