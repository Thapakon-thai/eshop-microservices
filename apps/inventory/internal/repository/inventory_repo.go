package repository

import (
	"context"
	"errors"

	"github.com/thapakon-thai/eshop-microservices/inventory/internal/models"
	"gorm.io/gorm"
)

type InventoryRepository interface {
	GetStock(ctx context.Context, productID string) (*models.Inventory, error)
	UpdateStock(ctx context.Context, productID string, change int32) (*models.Inventory, error)
}

type postgresRepo struct {
	db *gorm.DB
}

func NewPostgresRepository(db *gorm.DB) InventoryRepository {
	return &postgresRepo{db: db}
}

func (r *postgresRepo) GetStock(ctx context.Context, productID string) (*models.Inventory, error) {
	var inventory models.Inventory
	result := r.db.WithContext(ctx).Where("product_id = ?", productID).First(&inventory)
	if result.Error != nil {
		return nil, result.Error
	}
	return &inventory, nil
}

func (r *postgresRepo) UpdateStock(ctx context.Context, productID string, change int32) (*models.Inventory, error) {
	var inventory models.Inventory
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("product_id = ?", productID).First(&inventory).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				if change < 0 {
					return errors.New("insufficient stock") // Cannot deduct from 0
				}
				inventory = models.Inventory{ProductID: productID, Quantity: change}
				return tx.Create(&inventory).Error
			}
			return err
		}

		newQty := inventory.Quantity + change
		if newQty < 0 {
			return errors.New("insufficient stock")
		}
		inventory.Quantity = newQty
		return tx.Save(&inventory).Error
	})
	if err != nil {
		return nil, err
	}
	return &inventory, nil
}
