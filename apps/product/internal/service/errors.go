package service

import "errors"

var (
	ErrProductNotFound = errors.New("product not found")
	ErrInternalError   = errors.New("internal server error")
)
