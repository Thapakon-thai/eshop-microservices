const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8000;

// Auth Service Proxy
app.use('/auth', createProxyMiddleware({
    target: 'http://auth-service:8001',
    changeOrigin: true,
    pathRewrite: {
        '^/auth': '', // remove base path
    },
}));

// Order Service Proxy
app.use('/order', createProxyMiddleware({
    target: 'http://order-service:8002',
    changeOrigin: true,
    pathRewrite: {
        '^/order': '', // remove base path
    },
}));

// Payment Service Proxy (Optional, usually internal but exposed for debug if needed)
app.use('/payment', createProxyMiddleware({
    target: 'http://payment-service:8003',
    changeOrigin: true,
    pathRewrite: {
        '^/payment': '', // remove base path
    },
}));

app.get('/', (req, res) => {
    res.send('API Gateway is running');
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
