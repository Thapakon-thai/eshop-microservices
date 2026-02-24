package models

import (
	"time"
)

// Order represents the core business entity for an order.
type Order struct {
	ID          int64
	UserID      string
	Subtotal    float64
	ShippingFee float64
	Discount    float64
	TotalAmount float64
	Status      string // e.g., "pending", "paid", "shipped"
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Items       []OrderItem
}

// OrderItem represents a single item in an order.
type OrderItem struct {
	ID        int64
	OrderID   int64
	ProductID string
	Quantity  int
	Price     float64
}

// CreateOrderRequest is the domain request object for creating an order.
type CreateOrderRequest struct {
	UserID      string
	Items       []CreateOrderItem
	Subtotal    float64
	ShippingFee float64
	Discount    float64
}

// CreateOrderItem is the domain request object for items within a new order.
type CreateOrderItem struct {
	ProductID string
	Quantity  int
	Price     float64
}
