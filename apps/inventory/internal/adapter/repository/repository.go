package repository

import (
	"context"
	"errors"
	"time"

	"github.com/thapakon-thai/eshop-microservices/inventory/internal/models"
	"github.com/thapakon-thai/eshop-microservices/inventory/internal/service"
	"gorm.io/gorm"
)

// InventoryDBModel is the GORM representation of the inventory stock.
type InventoryDBModel struct {
	ID        int64  `gorm:"primaryKey"`
	ProductID string `gorm:"uniqueIndex"`
	Quantity  int32
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

func (InventoryDBModel) TableName() string {
	return "inventories"
}

type postgresRepo struct {
	db *gorm.DB
}

func NewPostgresRepository(db *gorm.DB) service.InventoryRepository {
	return &postgresRepo{db: db}
}

func (r *postgresRepo) GetStock(ctx context.Context, productID string) (*models.Inventory, error) {
	var dbModel InventoryDBModel
	result := r.db.WithContext(ctx).Where("product_id = ?", productID).First(&dbModel)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, service.ErrInventoryNotFound
		}
		return nil, result.Error
	}
	return toDomainModel(&dbModel), nil
}

func (r *postgresRepo) UpdateStock(ctx context.Context, productID string, change int32) (*models.Inventory, error) {
	var dbModel InventoryDBModel
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("product_id = ?", productID).First(&dbModel).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				if change < 0 {
					return service.ErrInsufficientStock // Cannot deduct from 0
				}
				dbModel = InventoryDBModel{ProductID: productID, Quantity: change}
				return tx.Create(&dbModel).Error
			}
			return err
		}

		newQty := dbModel.Quantity + change
		if newQty < 0 {
			return service.ErrInsufficientStock
		}
		dbModel.Quantity = newQty
		return tx.Save(&dbModel).Error
	})
	if err != nil {
		return nil, err
	}
	return toDomainModel(&dbModel), nil
}

func toDBModel(domain *models.Inventory) *InventoryDBModel {
	return &InventoryDBModel{
		ID:        domain.ID,
		ProductID: domain.ProductID,
		Quantity:  domain.Quantity,
		CreatedAt: domain.CreatedAt,
		UpdatedAt: domain.UpdatedAt,
	}
}

func toDomainModel(db *InventoryDBModel) *models.Inventory {
	return &models.Inventory{
		ID:        db.ID,
		ProductID: db.ProductID,
		Quantity:  db.Quantity,
		CreatedAt: db.CreatedAt,
		UpdatedAt: db.UpdatedAt,
	}
}
