package repository

import (
	"context"
	"errors"
	"time"

	"github.com/thapakon-thai/eshop-microservices/order/internal/models"
	"github.com/thapakon-thai/eshop-microservices/order/internal/service"
	"gorm.io/gorm"
)

// OrderDBModel is the GORM representation of the order.
type OrderDBModel struct {
	ID          int64 `gorm:"primaryKey"`
	UserID      string
	Subtotal    int64
	ShippingFee int64
	Discount    int64
	TotalAmount int64
	Status      string
	CreatedAt   time.Time          `gorm:"autoCreateTime"`
	UpdatedAt   time.Time          `gorm:"autoUpdateTime"`
	Items       []OrderItemDBModel `gorm:"foreignKey:OrderID"`
}

func (OrderDBModel) TableName() string {
	return "orders"
}

// OrderItemDBModel is the GORM representation of the order item.
type OrderItemDBModel struct {
	ID        int64 `gorm:"primaryKey"`
	OrderID   int64
	ProductID string
	Quantity  int
	Price     int64
}

func (OrderItemDBModel) TableName() string {
	return "order_items"
}

type postgresqlOrderRepo struct {
	db *gorm.DB
}

// constructor
func NewPostgresqlRepo(db *gorm.DB) service.OrderRepository {
	return &postgresqlOrderRepo{db: db}
}

func (r *postgresqlOrderRepo) CreateOrder(ctx context.Context, order *models.Order) error {
	dbOrder := toDBModel(order)

	if err := r.db.WithContext(ctx).Create(&dbOrder).Error; err != nil {
		return err // Or map to a specific domain DB error if required
	}

	// Update the domain order with assigned ID and timestamps
	order.ID = dbOrder.ID
	order.CreatedAt = dbOrder.CreatedAt
	order.UpdatedAt = dbOrder.UpdatedAt
	for i := range dbOrder.Items {
		order.Items[i].ID = dbOrder.Items[i].ID
	}

	return nil
}

func (r *postgresqlOrderRepo) GetOrders(ctx context.Context, id string) (*models.Order, error) {
	var dbOrder OrderDBModel
	if err := r.db.WithContext(ctx).Preload("Items").First(&dbOrder, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, service.ErrOrderNotFound
		}
		return nil, err
	}
	return toDomainModel(&dbOrder), nil
}

func (r *postgresqlOrderRepo) ListOrders(ctx context.Context) ([]*models.Order, error) {
	var dbOrders []OrderDBModel
	if err := r.db.WithContext(ctx).Preload("Items").Find(&dbOrders).Error; err != nil {
		return nil, err
	}

	var orders []*models.Order
	for _, dbo := range dbOrders {
		orders = append(orders, toDomainModel(&dbo))
	}
	return orders, nil
}

// --- Mapping Functions ---

func toDBModel(domain *models.Order) OrderDBModel {
	var items []OrderItemDBModel
	for _, item := range domain.Items {
		items = append(items, OrderItemDBModel{
			ID:        item.ID,
			OrderID:   item.OrderID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Price,
		})
	}

	return OrderDBModel{
		ID:          domain.ID,
		UserID:      domain.UserID,
		Subtotal:    domain.Subtotal,
		ShippingFee: domain.ShippingFee,
		Discount:    domain.Discount,
		TotalAmount: domain.TotalAmount,
		Status:      domain.Status,
		CreatedAt:   domain.CreatedAt,
		UpdatedAt:   domain.UpdatedAt,
		Items:       items,
	}
}

func toDomainModel(dbMode *OrderDBModel) *models.Order {
	var items []models.OrderItem
	for _, item := range dbMode.Items {
		items = append(items, models.OrderItem{
			ID:        item.ID,
			OrderID:   item.OrderID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Price,
		})
	}

	return &models.Order{
		ID:          dbMode.ID,
		UserID:      dbMode.UserID,
		Subtotal:    dbMode.Subtotal,
		ShippingFee: dbMode.ShippingFee,
		Discount:    dbMode.Discount,
		TotalAmount: dbMode.TotalAmount,
		Status:      dbMode.Status,
		CreatedAt:   dbMode.CreatedAt,
		UpdatedAt:   dbMode.UpdatedAt,
		Items:       items,
	}
}
