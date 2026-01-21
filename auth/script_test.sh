#!/bin/bash

# Configuration
KEY_DIR="keys_test"
PRIVATE_KEY="$KEY_DIR/private.pem"
PUBLIC_KEY="$KEY_DIR/public.pem"
PYTHON_CMD="python3.11"

# Setup cleanup trap
cleanup() {
    echo "Cleaning up..."
    rm -rf "$KEY_DIR"
}
trap cleanup EXIT

# Create key directory
mkdir -p "$KEY_DIR"

# Generate RSA keys
echo "Generating test keys..."
openssl genrsa -out "$PRIVATE_KEY" 2048 2>/dev/null
openssl rsa -in "$PRIVATE_KEY" -pubout -out "$PUBLIC_KEY" 2>/dev/null

# Install dependencies if needed
echo "Installing dependencies..."
$PYTHON_CMD -m pip install -r requirements.txt

# Run tests
echo "Running tests..."
export PRIVATE_KEY_PATH="$PRIVATE_KEY"
export PUBLIC_KEY_PATH="$PUBLIC_KEY"
export DATABASE_URL="sqlite+aiosqlite:///:memory:"

$PYTHON_CMD -m pytest -v
