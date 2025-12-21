package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/thapakon-thai/eshop-microservices/order-service/internal/service"
)

type OrderHandler struct {
	service service.OrderService
}

func NewOrderService(svc service.OrderService) *OrderHandler {
	return &OrderHandler{service: svc}
}

func Route() chi.Router {
	r := chi.NewRouter()

	r.Get("/health", HealthCheck)

	return r
}

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("All good"))
}

func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {

}

func (h *OrderHandler) GetOrders(w http.ResponseWriter, r *http.Request) {

}