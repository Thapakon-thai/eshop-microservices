const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002"],
    credentials: true,
  }),
);
const PORT = 8000;

// Auth Service Proxy
app.use(
  "/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || "http://auth-service:5001",
    changeOrigin: true,
    pathRewrite: {
      "^/auth": "/api/v1", // map /auth/* to /api/v1/*
    },
  }),
);

// Authentication Middleware
const checkAuth = async (req, res, next) => {
  delete req.headers["x-user-id"];

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  try {
    console.log(
      `Verifying token: ${token.substring(0, 10)} ... against ${process.env.AUTH_SERVICE_URL || "http://auth-service:5001"}/api/v1/verify`,
    );

    const response = await axios.post(
      `${process.env.AUTH_SERVICE_URL || "http://auth-service:5001"}/api/v1/verify`,
      {},
      {
        headers: { authorization: `Bearer ${token}` },
      },
    );

    req.headers["x-user-id"] = response.data.user_id;
    console.log(`User Id verified: ${response.data.user_id}`);
    next();
  } catch (error) {
    console.error("Auth verification failed:", error.message);
    if (error.response) {
      console.error("Data:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    }
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Order Service Proxy
app.use(
  "/order",
  checkAuth,
  createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL || "http://order-service:5002",
    changeOrigin: true,
    pathRewrite: {
      "^/order": "/api/v1", // map /order/* to /api/v1/*
    },
    onProxyReq: (proxyReq, req, res) => {
      // Explicitly set the header on the proxy request
      if (req.headers["x-user-id"]) {
        proxyReq.setHeader("x-user-id", req.headers["x-user-id"]);
      }
    },
  }),
);

// Payment Service Proxy (Optional, usually internal but exposed for debug if needed)
app.use(
  "/payment",
  checkAuth,
  createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL || "http://payment-service:5003",
    changeOrigin: true,
    pathRewrite: {
      "^/payment": "", // remove base path
    },
    onProxyReq: (proxyReq, req, res) => {
      // Explicitly set the header on the proxy request
      if (req.headers["x-user-id"]) {
        proxyReq.setHeader("x-user-id", req.headers["x-user-id"]);
      }
    },
  }),
);

/**
 * GATEWAY ROUTES
 */

const PROTO_PATH_PRODUCT = __dirname + "/packages/proto/product/product.proto";
const PROTO_PATH_INVENTORY =
  __dirname + "/packages/proto/inventory/inventory.proto";

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// Product Service Client
const productPackageDefinition = protoLoader.loadSync(PROTO_PATH_PRODUCT, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto = grpc.loadPackageDefinition(
  productPackageDefinition,
).product;
const productClient = new productProto.ProductService(
  process.env.PRODUCT_SERVICE_URL || "product-service:5004",
  grpc.credentials.createInsecure(),
);

// Inventory Service Client
const inventoryPackageDefinition = protoLoader.loadSync(PROTO_PATH_INVENTORY, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const inventoryProto = grpc.loadPackageDefinition(
  inventoryPackageDefinition,
).inventory;
const inventoryClient = new inventoryProto.InventoryService(
  process.env.INVENTORY_SERVICE_URL || "inventory-service:5005",
  grpc.credentials.createInsecure(),
);

// --- Product Routes (REST -> gRPC) ---
app.get("/products", (req, res) => {
  productClient.ListProducts(
    {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    },
    (err, response) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(response);
    },
  );
});

app.get("/products/:id", (req, res) => {
  productClient.GetProduct({ id: req.params.id }, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

app.post("/products", express.json({ limit: "50mb" }), (req, res) => {
  productClient.CreateProduct(req.body, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

app.delete("/products/:id", (req, res) => {
  productClient.DeleteProduct({ id: req.params.id }, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

// --- Inventory Routes (REST -> gRPC) ---
app.post("/inventory/stock", express.json(), (req, res) => {
  inventoryClient.UpdateStock(
    {
      product_id: req.body.product_id,
      quantity_change: req.body.quantity_change,
    },
    (err, response) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(response);
    },
  );
});

app.get("/inventory/:productId", (req, res) => {
  inventoryClient.GetStock(
    { product_id: req.params.productId },
    (err, response) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(response);
    },
  );
});

// --- Cart Service Proxy (HTTP) ---
app.use(
  "/cart",
  checkAuth,
  createProxyMiddleware({
    target: process.env.CART_SERVICE_URL || "http://cart-service:3001",
    changeOrigin: true,

    onProxyReq: (proxyReq, req, res) => {
      if (req.headers["x-user-id"]) {
        proxyReq.setHeader("x-user-id", req.headers["x-user-id"]);
      }
    },
  }),
);

app.get("/", (req, res) => {
  res.send("API Gateway is running");
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
