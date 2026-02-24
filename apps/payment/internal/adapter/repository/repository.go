package repository

import (
	"context"
	"errors"
	"time"

	"github.com/thapakon-thai/eshop-microservices/payment/internal/models"
	"github.com/thapakon-thai/eshop-microservices/payment/internal/service"
	"gorm.io/gorm"
)

// PaymentDBModel isolates GORM mappings from the pure domain model.
type PaymentDBModel struct {
	ID        string `gorm:"primaryKey"`
	OrderID   string `gorm:"index"`
	UserID    string `gorm:"index"`
	FullName  string
	Email     string
	Amount    int64 // Stored in DB as BIGINT (cents)
	Status    string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (PaymentDBModel) TableName() string {
	return "payments"
}

type postgresPaymentRepository struct {
	db *gorm.DB
}

func NewPostgresRepository(db *gorm.DB) service.PaymentRepository {
	return &postgresPaymentRepository{db: db}
}

func (r *postgresPaymentRepository) CreatePayment(ctx context.Context, payment *models.Payment) error {
	dbModel := toDBModel(payment)
	return r.db.WithContext(ctx).Create(dbModel).Error
}

func (r *postgresPaymentRepository) GetPaymentByID(ctx context.Context, id string) (*models.Payment, error) {
	var dbModel PaymentDBModel
	if err := r.db.WithContext(ctx).First(&dbModel, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, service.ErrPaymentNotFound
		}
		return nil, err
	}
	return toDomainModel(&dbModel), nil
}

func (r *postgresPaymentRepository) GetPaymentsByUserID(ctx context.Context, userID string) ([]*models.Payment, error) {
	var dbModels []PaymentDBModel
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&dbModels).Error; err != nil {
		return nil, err
	}

	var payments []*models.Payment
	for _, dbM := range dbModels {
		payments = append(payments, toDomainModel(&dbM))
	}
	return payments, nil
}

func (r *postgresPaymentRepository) UpdatePaymentStatus(ctx context.Context, id string, status models.PaymentStatus) error {
	result := r.db.WithContext(ctx).Model(&PaymentDBModel{}).Where("id = ?", id).Update("status", string(status))
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return service.ErrPaymentNotFound
	}
	return nil
}

func toDBModel(domain *models.Payment) *PaymentDBModel {
	return &PaymentDBModel{
		ID:        domain.ID,
		OrderID:   domain.OrderID,
		UserID:    domain.UserID,
		FullName:  domain.FullName,
		Email:     domain.Email,
		Amount:    domain.Amount,
		Status:    string(domain.Status),
		CreatedAt: domain.CreatedAt,
		UpdatedAt: domain.UpdatedAt,
	}
}

func toDomainModel(db *PaymentDBModel) *models.Payment {
	return &models.Payment{
		ID:        db.ID,
		OrderID:   db.OrderID,
		UserID:    db.UserID,
		FullName:  db.FullName,
		Email:     db.Email,
		Amount:    db.Amount,
		Status:    models.PaymentStatus(db.Status),
		CreatedAt: db.CreatedAt,
		UpdatedAt: db.UpdatedAt,
	}
}
