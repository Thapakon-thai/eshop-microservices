FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy the entire workspace context
COPY . .

# Build the payment service
RUN go build -o payment-service apps/payment/cmd/api/main.go

# Final stage
FROM alpine:latest

WORKDIR /app
COPY --from=builder /app/payment-service .

EXPOSE 5003

CMD ["./payment-service"]
