package service

import "errors"

var (
	ErrInventoryNotFound = errors.New("inventory not found")
	ErrInsufficientStock = errors.New("insufficient stock")
	ErrInternalError     = errors.New("internal server error")
)
