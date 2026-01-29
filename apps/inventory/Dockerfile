FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY apps/inventory/go.mod ./apps/inventory/
COPY packages/proto ./packages/proto
# COPY apps/inventory/go.sum ./apps/inventory/

WORKDIR /app/apps/inventory
RUN go mod tidy

COPY apps/inventory .
RUN go build -o main ./cmd/main.go

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/apps/inventory/main .

CMD ["./main"]
