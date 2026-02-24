package service

import (
	"context"
	"errors"
	"fmt"
	"log"

	"github.com/thapakon-thai/eshop-microservices/order/internal/models"
)

type OrderServiceImpl struct {
	repo            OrderRepository
	productClient   ProductServiceClient
	inventoryClient InventoryServiceClient
	publisher       OrderEventPublisher
}

func NewOrderService(
	repo OrderRepository,
	productClient ProductServiceClient,
	inventoryClient InventoryServiceClient,
	publisher OrderEventPublisher,
) *OrderServiceImpl {
	return &OrderServiceImpl{
		repo:            repo,
		productClient:   productClient,
		inventoryClient: inventoryClient,
		publisher:       publisher,
	}
}

func (s *OrderServiceImpl) CreateOrder(ctx context.Context, req *models.CreateOrderRequest) (*models.Order, error) {
	if err := req.Validate(); err != nil {
		return nil, err
	}

	var totalAmount int64
	var orderItems []models.OrderItem

	// Validate Products and Stock
	for _, itemReq := range req.Items {
		productRes, err := s.productClient.GetProduct(ctx, itemReq.ProductID)
		if err != nil {
			if errors.Is(err, ErrProductNotFound) {
				return nil, err
			}
			return nil, fmt.Errorf("failed to get product %s: %w", itemReq.ProductID, err)
		}

		price := productRes.Price

		stockQty, err := s.inventoryClient.CheckStock(ctx, itemReq.ProductID)
		if err != nil {
			return nil, fmt.Errorf("failed to check stock for %s: %w", itemReq.ProductID, err)
		}
		if stockQty < int32(itemReq.Quantity) {
			return nil, fmt.Errorf("%w for product %s", ErrInventoryShortage, itemReq.ProductID)
		}

		err = s.inventoryClient.DeductStock(ctx, itemReq.ProductID, int32(itemReq.Quantity))
		if err != nil {
			// In a real system, we'd need to rollback previous deductions here / implement saga.
			return nil, fmt.Errorf("failed to deduct stock for %s: %w", itemReq.ProductID, err)
		}

		totalAmount += price * int64(itemReq.Quantity)

		orderItems = append(orderItems, models.OrderItem{
			ProductID: itemReq.ProductID,
			Quantity:  itemReq.Quantity,
			Price:     price,
		})
	}

	// Use provided subtotal if available, otherwise use calculated amount
	subtotal := req.Subtotal
	if subtotal == 0 {
		subtotal = totalAmount
	}

	// Calculate total: subtotal + shipping - discount
	finalTotal := subtotal + req.ShippingFee - req.Discount

	order := &models.Order{
		UserID:      req.UserID,
		Subtotal:    subtotal,
		ShippingFee: req.ShippingFee,
		Discount:    req.Discount,
		TotalAmount: finalTotal,
		Status:      "pending",
		Items:       orderItems,
	}

	err := s.repo.CreateOrder(ctx, order)
	if err != nil {
		return nil, fmt.Errorf("failed to create order: %w", err)
	}

	if err := s.publisher.PublishOrderCreated(order); err != nil {
		log.Printf("Failed to publish order created event: %v\n", err)
	}

	return order, nil
}

func (s *OrderServiceImpl) GetOrders(ctx context.Context, id string) (*models.Order, error) {
	order, err := s.repo.GetOrders(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get order: %w", err)
	}
	return order, nil
}

func (s *OrderServiceImpl) ListOrders(ctx context.Context) ([]*models.Order, error) {
	orders, err := s.repo.ListOrders(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list orders: %w", err)
	}
	return orders, nil
}

func (s *OrderServiceImpl) UpdateOrderStatus(ctx context.Context, id string, status string) error {
	validStatuses := map[string]bool{
		"pending": true, "paid": true, "processing": true,
		"completed": true, "cancelled": true, "failed": true,
	}
	if !validStatuses[status] {
		return fmt.Errorf("invalid order status: %s", status)
	}
	err := s.repo.UpdateOrderStatus(ctx, id, status)
	if err != nil {
		return err
	}

	order, err := s.repo.GetOrders(ctx, id)
	if err == nil {
		if pubErr := s.publisher.PublishOrderStatusUpdated(order); pubErr != nil {
			log.Printf("Failed to publish order status updated event: %v\n", pubErr)
		}
	} else {
		log.Printf("Failed to fetch order to publish update event: %v\n", err)
	}

	return nil
}
