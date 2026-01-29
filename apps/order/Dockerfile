FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY apps/order/go.mod ./apps/order/
COPY packages/proto ./packages/proto
# COPY apps/order/go.sum ./apps/order/

WORKDIR /app/apps/order
COPY apps/order .
RUN go mod tidy

RUN go build -o main ./cmd/main.go

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/apps/order/main .

CMD ["./main"]
