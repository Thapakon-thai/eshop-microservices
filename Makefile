
.PHONY: gen-go

gen-go:
	protoc --go_out=. --go_opt=paths=source_relative \
	--go-grpc_out=. --go-grpc_opt=paths=source_relative \
	proto/auth.proto proto/product.proto proto/order.proto
