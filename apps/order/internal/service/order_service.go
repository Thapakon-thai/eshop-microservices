package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/shopspring/decimal"
	"github.com/thapakon-thai/eshop-microservices/order/internal/infrastructure"
	"github.com/thapakon-thai/eshop-microservices/order/internal/models"
	"github.com/thapakon-thai/eshop-microservices/order/internal/repository"
	invPb "github.com/thapakon-thai/eshop-microservices/proto/inventory"
	pb "github.com/thapakon-thai/eshop-microservices/proto/product"
)

type OrderService interface {
	CreateOrder(ctx context.Context, req *models.CreateOrderRequest) (*models.Order, error)
	GetOrders(ctx context.Context, id string) (*models.Order, error)
	ListOrders(ctx context.Context) ([]*models.Order, error)
}

type OrderServiceImpl struct {
	repo        repository.OrderRepo
	grpcClients *infrastructure.GrpcClients
	publisher   *infrastructure.EventPublisher
}

// constructor
func NewOrderService(repo repository.OrderRepo, grpcClients *infrastructure.GrpcClients, publisher *infrastructure.EventPublisher) *OrderServiceImpl {
	return &OrderServiceImpl{
		repo:        repo,
		grpcClients: grpcClients,
		publisher:   publisher,
	}
}

func (s *OrderServiceImpl) CreateOrder(ctx context.Context, req *models.CreateOrderRequest) (*models.Order, error) {
	if len(req.Items) == 0 {
		return nil, errors.New("items cannot be empty")
	}

	var totalAmount decimal.Decimal
	var orderItems []models.OrderItem

	// Validate Products and Check/Deduct Stock
	for _, itemReq := range req.Items {
		// 1. Get Product Details
		productRes, err := s.grpcClients.ProductClient.GetProduct(ctx, &pb.GetProductRequest{Id: itemReq.ProductID})
		if err != nil {
			return nil, fmt.Errorf("failed to get product %s: %v", itemReq.ProductID, err)
		}

		// Validate Price
		price := decimal.NewFromFloat(productRes.Price)

		// 2. Check Stock
		stockRes, err := s.grpcClients.InventoryClient.GetStock(ctx, &invPb.GetStockRequest{ProductId: itemReq.ProductID})
		if err != nil {
			return nil, fmt.Errorf("failed to check stock for %s: %v", itemReq.ProductID, err)
		}
		if stockRes.Quantity < int32(itemReq.Quantity) {
			return nil, fmt.Errorf("insufficient stock for product %s", itemReq.ProductID)
		}

		// 3. Deduct Stock
		_, err = s.grpcClients.InventoryClient.UpdateStock(ctx, &invPb.UpdateStockRequest{
			ProductId:      itemReq.ProductID,
			QuantityChange: -int32(itemReq.Quantity),
		})
		if err != nil {
			// In a real system, we'd need to rollback previous deductions here!
			return nil, fmt.Errorf("failed to deduct stock for %s: %v", itemReq.ProductID, err)
		}

		totalAmount = totalAmount.Add(price.Mul(decimal.NewFromInt(int64(itemReq.Quantity))))
		orderItems = append(orderItems, models.OrderItem{
			ProductID: itemReq.ProductID,
			Quantity:  itemReq.Quantity,
			Price:     price,
		})
	}

	// Save to DB
	order := &models.Order{
		UserID:      req.UserID,
		TotalAmount: totalAmount.InexactFloat64(),
		Status:      "pending",
		Items:       orderItems,
	}

	err := s.repo.CreateOrder(ctx, order)
	if err != nil {
		return nil, fmt.Errorf("failed to create order: %v", err)
	}

	// Publish Event
	event := map[string]interface{}{
		"order_id": order.ID,
		"user_id":  order.UserID,
		"amount":   order.TotalAmount,
		"status":   order.Status,
		"items":    order.Items,
	}
	if err := s.publisher.PublishOrderCreated(event); err != nil {
		fmt.Printf("Failed to publish order created event: %v\n", err)
	}

	return order, nil
}

func (s *OrderServiceImpl) GetOrders(ctx context.Context, id string) (*models.Order, error) {
	return s.repo.GetOrders(ctx, id)
}

func (s *OrderServiceImpl) ListOrders(ctx context.Context) ([]*models.Order, error) {
	return s.repo.ListOrders(ctx)
}
