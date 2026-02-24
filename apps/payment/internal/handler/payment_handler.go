package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/thapakon-thai/eshop-microservices/payment/internal/service"
)

type PaymentHandler struct {
	service service.PaymentService
}

func NewPaymentHandler(svc service.PaymentService) *PaymentHandler {
	return &PaymentHandler{service: svc}
}

func RegisterRoutes(app *fiber.App, handler *PaymentHandler) {
	api := app.Group("/api/v1") // Adding versioning as a best practice

	api.Get("/health", HealthCheck)
	api.Get("/payments", handler.ListPayments)
	api.Get("/payments/user/:userID", handler.ListUserPayments)
	api.Get("/payments/:id", handler.GetPayment)
}

func HealthCheck(c *fiber.Ctx) error {
	return c.Status(fiber.StatusOK).SendString("Payment Service (Go/Fiber) is healthy")
}

func (h *PaymentHandler) ListPayments(c *fiber.Ctx) error {
	// For compatibility with previous implementation returning empty list
	return c.JSON([]interface{}{})
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

	return c.JSON(payments)
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

	return c.JSON(payment)
}

