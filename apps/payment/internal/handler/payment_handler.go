package handler

import (
	"math"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/thapakon-thai/eshop-microservices/payment/internal/models"
	"github.com/thapakon-thai/eshop-microservices/payment/internal/service"
)

// DTOs (Data Transfer Objects) for the HTTP Adapter Layer
type CreatePaymentRequest struct {
	OrderID  string  `json:"order_id"`
	UserID   string  `json:"user_id"`
	FullName string  `json:"full_name"`
	Email    string  `json:"email"`
	Amount   float64 `json:"amount"` // Accepts float64 from external callers
}

type PaymentResponse struct {
	ID        string               `json:"id"`
	OrderID   string               `json:"order_id"`
	UserID    string               `json:"user_id"`
	FullName  string               `json:"full_name"`
	Email     string               `json:"email"`
	Amount    float64              `json:"amount"` // Resolves domain int64 back to external float64
	Status    models.PaymentStatus `json:"status"`
	CreatedAt time.Time            `json:"created_at"`
	UpdatedAt time.Time            `json:"updated_at"`
}

type PaymentHandler struct {
	service service.PaymentService // Dependent exclusively on the Port
}

func NewPaymentHandler(svc service.PaymentService) *PaymentHandler {
	return &PaymentHandler{service: svc}
}

func RegisterRoutes(app *fiber.App, handler *PaymentHandler) {
	api := app.Group("/api/v1") // Adding versioning as a best practice

	api.Get("/health", HealthCheck)
	api.Post("/payments", handler.CreatePayment)
	api.Get("/payments", handler.ListAllPayments)
	api.Get("/payments/user/:userID", handler.ListUserPayments)
	api.Get("/payments/:id", handler.GetPayment)
}

func HealthCheck(c *fiber.Ctx) error {
	return c.Status(fiber.StatusOK).SendString("Payment Service (Go/Fiber Hexagonal) is healthy")
}

func (h *PaymentHandler) CreatePayment(c *fiber.Ctx) error {
	var req CreatePaymentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	// Adapter translates incoming float64 (dollars) to int64 (cents) for the Domain Core
	amountInCents := int64(math.Round(req.Amount * 100))

	payment, err := h.service.ProcessPayment(c.Context(), req.OrderID, req.UserID, req.FullName, req.Email, amountInCents)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(mapToResponse(payment))
}

func (h *PaymentHandler) ListUserPayments(c *fiber.Ctx) error {
	userID := c.Params("userID")
	if userID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User ID is required"})
	}

	payments, err := h.service.GetUserPayments(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	responses := make([]PaymentResponse, len(payments))
	for i, p := range payments {
		responses[i] = mapToResponse(p)
	}

	return c.JSON(responses)
}

func (h *PaymentHandler) GetPayment(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Payment ID is required"})
	}

	payment, err := h.service.GetPaymentByID(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Payment not found"})
	}

	return c.JSON(mapToResponse(payment))
}

func (h *PaymentHandler) ListAllPayments(c *fiber.Ctx) error {
	payments, err := h.service.ListAllPayments(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	responses := make([]PaymentResponse, len(payments))
	for i, p := range payments {
		responses[i] = mapToResponse(p)
	}

	return c.JSON(responses)
}

func mapToResponse(domain *models.Payment) PaymentResponse {
	return PaymentResponse{
		ID:        domain.ID,
		OrderID:   domain.OrderID,
		UserID:    domain.UserID,
		FullName:  domain.FullName,
		Email:     domain.Email,
		Amount:    float64(domain.Amount) / 100.0, // Transform cents back to standard external float64 formatting
		Status:    domain.Status,
		CreatedAt: domain.CreatedAt,
		UpdatedAt: domain.UpdatedAt,
	}
}
