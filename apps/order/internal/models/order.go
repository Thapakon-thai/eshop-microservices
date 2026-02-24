package models

import (
	"errors"
	"time"
)

// Order represents the core business entity for an order.
type Order struct {
	ID          int64       
	UserID      string      
	Subtotal    int64       
	ShippingFee int64       
	Discount    int64       
	TotalAmount int64       
	Status      string      
	CreatedAt   time.Time   
	UpdatedAt   time.Time   
	Items       []OrderItem 
}

// OrderItem represents a single item in an order.
type OrderItem struct {
	ID        int64  
	OrderID   int64  `json:"order_id"`
	ProductID string `json:"product_id"`
	Quantity  int    `json:"quantity"`
	Price     int64  `json:"price"`
}

// CreateOrderRequest is the domain request object for creating an order.
type CreateOrderRequest struct {
	UserID      string            
	Items       []CreateOrderItem 
	Subtotal    int64             
	ShippingFee int64             
	Discount    int64             
}

// CreateOrderItem is the domain request object for items within a new order.
type CreateOrderItem struct {
	ProductID string 
	Quantity  int    
	Price     int64  
}

func (req *CreateOrderRequest) Validate() error {
	if req.UserID == "" {
		return errors.New("user_id cannot be empty")
	}
	if len(req.Items) == 0 {
		return errors.New("order must contain at least one item")
	}
	for _, item := range req.Items {
		if item.Quantity <= 0 {
			return errors.New("item quantity must be greater than zero")
		}
	}
	if req.Subtotal < 0 || req.ShippingFee < 0 || req.Discount < 0 {
		return errors.New("currency fields cannot be negative")
	}
	return nil
}
