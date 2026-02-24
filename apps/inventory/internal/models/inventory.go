package models

import (
	"errors"
	"time"
)

// Inventory represents the pure business entity for a product's stock.
type Inventory struct {
	ID        int64
	ProductID string
	Quantity  int32
	CreatedAt time.Time
	UpdatedAt time.Time
}

// Validate ensures structural business rules are met.
func (i *Inventory) Validate() error {
	if i.ProductID == "" {
		return errors.New("product ID cannot be empty")
	}
	if i.Quantity < 0 {
		return errors.New("inventory quantity cannot be inherently negative")
	}
	return nil
}
