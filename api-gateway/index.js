const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');

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

// Authentication Middleware
const checkAuth = async (req, res, next) => {
    delete req.headers['x-user-id'];
    
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if(!token) {
        return res.status(401).json({ error: 'Missing Bearer token' })
    }

    try {
        console.log(`Verifying token: ${token.substring(0, 10)} ... against http://auth-service:8001/api/v1/verify`)

        const response = await axios.get('http://auth-service:8001/api/v1/verify', {
            headers: {authorization: `Bearer ${token}` }
        });

        req.headers['x-user-id'] = response.data.user_id;
        console.log(`User Id verified: ${response.data.user_id}`);
        next();

    } catch (error) {
        console.error('Auth verification failed:', error.message)
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}


// Order Service Proxy
app.use('/order', checkAuth, createProxyMiddleware({
    target: 'http://order-service:8002',
    changeOrigin: true,
    pathRewrite: {
        '^/order': '', // remove base path
    },
    onProxyReq: (proxyReq, req, res) => {
        // Explicitly set the header on the proxy request
        if (req.headers['x-user-id']) {
            proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
        }
    }
}));

// Payment Service Proxy (Optional, usually internal but exposed for debug if needed)
app.use('/payment', checkAuth, createProxyMiddleware({
    target: 'http://payment-service:8003',
    changeOrigin: true,
    pathRewrite: {
        '^/payment': '', // remove base path
    },
    onProxyReq: (proxyReq, req, res) => {
        // Explicitly set the header on the proxy request
        if (req.headers['x-user-id']) {
            proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
        }
    }
}));

app.get('/', (req, res) => {
    res.send('API Gateway is running');
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
