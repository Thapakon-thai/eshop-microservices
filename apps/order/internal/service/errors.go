package service

import "errors"

var (
	ErrOrderNotFound     = errors.New("order not found")
	ErrInventoryShortage = errors.New("insufficient stock")
	ErrProductNotFound   = errors.New("product not found")
	ErrInternalError     = errors.New("an internal error occurred")
)
