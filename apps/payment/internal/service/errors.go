package service

import "errors"

var (
	ErrPaymentNotFound = errors.New("payment not found")
	ErrInvalidAmount   = errors.New("invalid payment amount")
	ErrInternalError   = errors.New("internal server error")
)
