import express from 'express';
import dotenv from 'dotenv';
import { connectRedis } from './config/redis';
import { CartService } from './services/cartService';

dotenv.config();

const app = express();
const port = process.env.CART_SERVICE_PORT || 3001;

app.use(express.json());

// Helper to get userId from header
const getUserId = (req: express.Request): string | undefined => {
    return req.headers['x-user-id'] as string;
};

// --- Header-based Routes (Preferred) ---

app.get('/cart', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'User ID missing in headers' });
    try {
        const cart = await CartService.getCart(userId);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/cart/item', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'User ID missing in headers' });
    try {
        const cart = await CartService.addItem(userId, req.body);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/cart/item/:productId', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'User ID missing in headers' });
    try {
        const { size, color } = req.query;
        const cart = await CartService.removeItem(
            userId, 
            req.params.productId, 
            size as string, 
            color as string
        );
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/cart', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'User ID missing in headers' });
    try {
        await CartService.clearCart(userId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Parameter-based Routes (Legacy/Internal) ---

app.get('/cart/:userId', async (req, res) => {
    try {
        const cart = await CartService.getCart(req.params.userId);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/cart/:userId/item', async (req, res) => {
    try {
        const cart = await CartService.addItem(req.params.userId, req.body);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/cart/:userId/item/:productId', async (req, res) => {
    try {
        const cart = await CartService.removeItem(req.params.userId, req.params.productId);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/cart/:userId', async (req, res) => {
    try {
        await CartService.clearCart(req.params.userId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, async () => {
    await connectRedis();
    console.log(`Cart Service running on port ${port}`);
});
