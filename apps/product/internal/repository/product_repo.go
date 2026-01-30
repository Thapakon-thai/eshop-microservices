package repository

import (
	"context"

	"github.com/thapakon-thai/eshop-microservices/product/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ProductRepository interface {
	Create(ctx context.Context, product *models.Product) error
	FindByID(ctx context.Context, id string) (*models.Product, error)
	FindAll(ctx context.Context, page, limit int32, categoryID string) ([]*models.Product, int64, error)
	Delete(ctx context.Context, id string) error
}

type mongoRepository struct {
	db *mongo.Database
}

func NewMongoRepository(db *mongo.Database) ProductRepository {
	return &mongoRepository{db: db}
}

func (r *mongoRepository) Create(ctx context.Context, product *models.Product) error {
	if product.ID.IsZero() {
		product.ID = primitive.NewObjectID()
	}
	_, err := r.db.Collection("products").InsertOne(ctx, product)
	return err
}

func (r *mongoRepository) FindByID(ctx context.Context, id string) (*models.Product, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	var product models.Product
	err = r.db.Collection("products").FindOne(ctx, bson.M{"_id": oid}).Decode(&product)
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *mongoRepository) FindAll(ctx context.Context, page, limit int32, categoryID string) ([]*models.Product, int64, error) {
	filter := bson.M{}
	if categoryID != "" {
		filter["category_id"] = categoryID
	}

	// Count total
	total, err := r.db.Collection("products").CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	l := int64(limit)
	p := int64(page)
	if l <= 0 {
		l = 10
	}
	if p <= 0 {
		p = 1
	}

	opts := options.Find().SetSkip((p - 1) * l).SetLimit(l)
	cursor, err := r.db.Collection("products").Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var products []*models.Product
	if err = cursor.All(ctx, &products); err != nil {
		return nil, 0, err
	}
	return products, total, nil
}

func (r *mongoRepository) Delete(ctx context.Context, id string) error {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = r.db.Collection("products").DeleteOne(ctx, bson.M{"_id": oid})
	return err
}
