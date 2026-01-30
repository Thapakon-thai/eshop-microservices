package handler

import (
	"context"

	"github.com/thapakon-thai/eshop-microservices/product/internal/models"
	"github.com/thapakon-thai/eshop-microservices/product/internal/service"
	pb "github.com/thapakon-thai/eshop-microservices/proto/product"
)

type ProductGrpcHandler struct {
	pb.UnimplementedProductServiceServer
	svc *service.ProductService
}

func NewProductGrpcHandler(svc *service.ProductService) *ProductGrpcHandler {
	return &ProductGrpcHandler{svc: svc}
}

func (h *ProductGrpcHandler) GetProduct(ctx context.Context, req *pb.GetProductRequest) (*pb.ProductResponse, error) {
	product, err := h.svc.GetProduct(ctx, req.Id)
	if err != nil {
		return nil, err
	}
	return &pb.ProductResponse{
		Id:          product.ID.Hex(),
		Name:        product.Name,
		Description: product.Description,
		Price:       product.Price,
		Stock:       product.Stock,
		CategoryId:  product.CategoryID,
		Sizes:       product.Sizes,
		Colors:      product.Colors,
		Images:      product.Images,
	}, nil
}

func (h *ProductGrpcHandler) ListProducts(ctx context.Context, req *pb.ListProductsRequest) (*pb.ListProductsResponse, error) {
	products, total, err := h.svc.ListProducts(ctx, req.Page, req.Limit, req.CategoryId)
	if err != nil {
		return nil, err
	}

	var pbProducts []*pb.ProductResponse
	for _, p := range products {
		pbProducts = append(pbProducts, &pb.ProductResponse{
			Id:          p.ID.Hex(),
			Name:        p.Name,
			Description: p.Description,
			Price:       p.Price,
			Stock:       p.Stock,
			CategoryId:  p.CategoryID,
			Sizes:       p.Sizes,
			Colors:      p.Colors,
			Images:      p.Images,
		})
	}

	return &pb.ListProductsResponse{
		Products:   pbProducts,
		TotalCount: int32(total),
	}, nil
}

func (h *ProductGrpcHandler) CreateProduct(ctx context.Context, req *pb.CreateProductRequest) (*pb.ProductResponse, error) {
	product := &models.Product{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Stock:       req.Stock,
		CategoryID:  req.CategoryId,
		Sizes:       req.Sizes,
		Colors:      req.Colors,
		Images:      req.Images,
	}

	if err := h.svc.CreateProduct(ctx, product); err != nil {
		return nil, err
	}

	return &pb.ProductResponse{
		Id:          product.ID.Hex(),
		Name:        product.Name,
		Description: product.Description,
		Price:       product.Price,
		Stock:       product.Stock,
		CategoryId:  product.CategoryID,
		Sizes:       product.Sizes,
		Colors:      product.Colors,
		Images:      product.Images,
	}, nil
}

func (h *ProductGrpcHandler) DeleteProduct(ctx context.Context, req *pb.DeleteProductRequest) (*pb.DeleteProductResponse, error) {
	if err := h.svc.DeleteProduct(ctx, req.Id); err != nil {
		return nil, err
	}
	return &pb.DeleteProductResponse{Success: true}, nil
}
