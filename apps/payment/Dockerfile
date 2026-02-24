FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY apps/payment/go.mod ./apps/payment/
COPY packages/proto ./packages/proto

WORKDIR /app/apps/payment
COPY apps/payment .
RUN go mod tidy

RUN go build -o main ./cmd/api/main.go

# Final stage
FROM alpine:latest

WORKDIR /app
COPY --from=builder /app/apps/payment/main .

EXPOSE 5003

CMD ["./main"]
