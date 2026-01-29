FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY apps/product/go.mod ./apps/product/
COPY packages/proto ./packages/proto
# COPY apps/product/go.sum ./apps/product/ 

WORKDIR /app/apps/product
RUN go mod tidy

COPY apps/product .
RUN go build -o main ./cmd/main.go

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/apps/product/main .

CMD ["./main"]
