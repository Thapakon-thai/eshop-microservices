package models

import "errors"

// Product represents the pure business entity for a product.
type Product struct {
	ID          string // MongoDB Adapter will map this to/from ObjectID
	Name        string
	Description string
	Price       int64 // Stored in Cents (e.g. 1000 = $10.00)
	Stock       int32
	CategoryID  string
	Sizes       []string
	Colors      []string
	Images      map[string]string
}

// Validate ensures the Product adheres to business rules.
func (p *Product) Validate() error {
	if p.Name == "" {
		return errors.New("product name cannot be empty")
	}
	if p.Price < 0 {
		return errors.New("product price cannot be negative")
	}
	if p.Stock < 0 {
		return errors.New("product stock cannot be negative")
	}
	return nil
}
