#!/bin/bash

# Configuration
GATEWAY_URL="http://localhost:8000"
USERNAME="testuser_$(date +%s)"
PASSWORD="password123"

echo "--------------------------------------------------"
echo "1. Registering User..."
REGISTER_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/auth/api/v1/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\", \"email\": \"$USERNAME@example.com\"}")
echo "Response: $REGISTER_RESPONSE"

echo "--------------------------------------------------"
echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/auth/api/v1/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$USERNAME@example.com\", \"password\": \"$PASSWORD\"}")
echo "Response: $LOGIN_RESPONSE"

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token": *"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Error: Failed to get access token"
  exit 1
fi
echo "Access Token: $ACCESS_TOKEN"

echo "--------------------------------------------------"
echo "3. Creating Product..."
PRODUCT_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A product for testing",
    "price": 99.99,
    "stock": 100,
    "category_id": "test-cat"
  }')
echo "Response: $PRODUCT_RESPONSE"

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"id": *"[^"]*"' | cut -d'"' -f4)

if [ -z "$PRODUCT_ID" ]; then
  echo "Error: Failed to get product ID" 
  # Fallback if ID is unquoted or different format? JSON parsing in bash is brittle.
  # Let's try to just use jq if available, or regex.
  # If failed, maybe product creation failed.
  exit 1
fi
echo "Product ID: $PRODUCT_ID"

echo "--------------------------------------------------"
echo "4. Checking Stock (Inventory)..."
INVENTORY_RESPONSE=$(curl -s -X GET "$GATEWAY_URL/inventory/$PRODUCT_ID")
echo "Response: $INVENTORY_RESPONSE"

echo "--------------------------------------------------"
echo "4a. Seeding Stock..."
STOCK_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/inventory/stock" \
  -H "Content-Type: application/json" \
  -d "{
    \"product_id\": \"$PRODUCT_ID\",
    \"quantity_change\": 100
  }")
echo "Response: $STOCK_RESPONSE"

echo "--------------------------------------------------"
echo "5. Creating Order..."
ORDER_RESPONSE=$(curl -s -X POST "$GATEWAY_URL/order/api/v1/orders" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USERNAME\", 
    \"items\": [
      {
        \"product_id\": \"$PRODUCT_ID\",
        \"quantity\": 1
      }
    ]
  }")
echo "Response: $ORDER_RESPONSE"

ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"id": *[0-9]*' | cut -d':' -f2 | tr -d ' ')
echo "Order ID: $ORDER_ID"

echo "--------------------------------------------------"
echo "6. Checking Stock After Order..."
INVENTORY_RESPONSE_AFTER=$(curl -s -X GET "$GATEWAY_URL/inventory/$PRODUCT_ID")
echo "Response: $INVENTORY_RESPONSE_AFTER"

echo "--------------------------------------------------"
echo "7. Verifying Notification..."
echo "Checking logs for notification service..."
docker-compose logs --tail=20 notification-service
