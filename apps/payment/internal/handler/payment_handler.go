package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/thapakon-thai/eshop-microservices/payment/internal/service"
)

type PaymentHandler struct {
	service service.PaymentService
}

func NewPaymentHandler(svc service.PaymentService) *PaymentHandler {
	return &PaymentHandler{service: svc}
}

func Route(handler *PaymentHandler) chi.Router {
	r := chi.NewRouter()

	r.Get("/health", HealthCheck)
	r.Get("/payments", handler.ListPayments)
	r.Get("/payments/user/{userID}", handler.ListUserPayments)
	r.Get("/payments/{id}", handler.GetPayment)
	
	return r
}

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Payment Service (Go) is healthy"))
}

func (h *PaymentHandler) ListPayments(w http.ResponseWriter, r *http.Request) {
	// For now, returning empty list or something generic as the Java one did
	// ListPayments is not implemented in service yet, but let's just return empty for compatibility
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode([]interface{}{})
}

func (h *PaymentHandler) ListUserPayments(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")
	if userID == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	payments, err := h.service.GetUserPayments(r.Context(), userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payments)
}

func (h *PaymentHandler) GetPayment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "Payment ID is required", http.StatusBadRequest)
		return
	}

	payment, err := h.service.GetPaymentByID(r.Context(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payment)
}

