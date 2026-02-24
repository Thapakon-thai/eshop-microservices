package repository

import (
	"context"

	"github.com/thapakon-thai/eshop-microservices/product/internal/models"
	"github.com/thapakon-thai/eshop-microservices/product/internal/service"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ProductDBModel is the MongoDB representation of a product.
type ProductDBModel struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`
	Price       int64              `bson:"price"` // stored in cents
	Stock       int32              `bson:"stock"`
	CategoryID  string             `bson:"category_id"`
	Sizes       []string           `bson:"sizes"`
	Colors      []string           `bson:"colors"`
	Images      map[string]string  `bson:"images"`
}

type mongoRepository struct {
	db *mongo.Database
}

func NewMongoRepository(db *mongo.Database) service.ProductRepository {
	return &mongoRepository{db: db}
}

func (r *mongoRepository) Create(ctx context.Context, product *models.Product) error {
	dbModel := toDBModel(product)

	if dbModel.ID.IsZero() {
		dbModel.ID = primitive.NewObjectID()
	}

	_, err := r.db.Collection("products").InsertOne(ctx, dbModel)
	if err != nil {
		return err
	}

	// Assign the generated ID back to the pure Domain model
	product.ID = dbModel.ID.Hex()
	return nil
}

func (r *mongoRepository) FindByID(ctx context.Context, id string) (*models.Product, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		// Provide a clean domain error instead of leaking mongo hex parsing error
		return nil, service.ErrProductNotFound
	}

	var dbProduct ProductDBModel
	err = r.db.Collection("products").FindOne(ctx, bson.M{"_id": oid}).Decode(&dbProduct)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, service.ErrProductNotFound
		}
		return nil, err
	}
	return toDomainModel(&dbProduct), nil
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

	var dbProducts []ProductDBModel
	if err = cursor.All(ctx, &dbProducts); err != nil {
		return nil, 0, err
	}

	var products []*models.Product
	for _, dbp := range dbProducts {
		products = append(products, toDomainModel(&dbp))
	}

	return products, total, nil
}

func (r *mongoRepository) Delete(ctx context.Context, id string) error {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return service.ErrProductNotFound
	}
	res, err := r.db.Collection("products").DeleteOne(ctx, bson.M{"_id": oid})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return service.ErrProductNotFound
	}
	return nil
}

func toDBModel(domain *models.Product) *ProductDBModel {
	var oid primitive.ObjectID
	if domain.ID != "" {
		parsed, err := primitive.ObjectIDFromHex(domain.ID)
		if err == nil {
			oid = parsed
		}
	}
	return &ProductDBModel{
		ID:          oid,
		Name:        domain.Name,
		Description: domain.Description,
		Price:       domain.Price,
		Stock:       domain.Stock,
		CategoryID:  domain.CategoryID,
		Sizes:       domain.Sizes,
		Colors:      domain.Colors,
		Images:      domain.Images,
	}
}

func toDomainModel(db *ProductDBModel) *models.Product {
	return &models.Product{
		ID:          db.ID.Hex(),
		Name:        db.Name,
		Description: db.Description,
		Price:       db.Price,
		Stock:       db.Stock,
		CategoryID:  db.CategoryID,
		Sizes:       db.Sizes,
		Colors:      db.Colors,
		Images:      db.Images,
	}
}
