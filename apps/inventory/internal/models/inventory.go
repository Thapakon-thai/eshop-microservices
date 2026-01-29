package models

import "gorm.io/gorm"

type Inventory struct {
	gorm.Model
	ProductID string `gorm:"uniqueIndex"`
	Quantity  int32
}
