package handler

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/thapakon-thai/eshop-microservices/order/internal/models"
	"github.com/thapakon-thai/eshop-microservices/order/internal/service"
)

type OrderHandler struct {
	service service.OrderService
}

func NewOrderHandler(svc service.OrderService) *OrderHandler {
	return &OrderHandler{service: svc}
}

func RegisterRoutes(app *fiber.App, handler *OrderHandler) {
	api := app.Group("/api/v1")

	api.Get("/health", HealthCheck)
	api.Post("/orders", handler.CreateOrder)
	api.Get("/orders", handler.ListOrders)
	api.Get("/orders/:id", handler.GetOrders)
	api.Patch("/orders/:id/status", handler.UpdateOrderStatus)
}

func HealthCheck(c *fiber.Ctx) error {
	return c.Status(fiber.StatusOK).SendString("All good")
}

func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	var req models.CreateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Extract UserID from header (set by API Gateway)
	userID := c.Get("x-user-id")
	if userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	req.UserID = userID

	order, err := h.service.CreateOrder(c.Context(), &req)
	if err != nil {
		// Map domain-specific errors to HTTP statuses
		if errors.Is(err, service.ErrInventoryShortage) || errors.Is(err, service.ErrProductNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(order)
}

func (h *OrderHandler) GetOrders(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Order ID is required"})
	}

	order, err := h.service.GetOrders(c.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrOrderNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(order)
}

func (h *OrderHandler) ListOrders(c *fiber.Ctx) error {
	orders, err := h.service.ListOrders(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(orders)
}

func (h *OrderHandler) UpdateOrderStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Order ID is required"})
	}

	var body struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&body); err != nil || body.Status == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Status is required"})
	}

	if err := h.service.UpdateOrderStatus(c.Context(), id, body.Status); err != nil {
		if errors.Is(err, service.ErrOrderNotFound) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Order status updated"})
}
