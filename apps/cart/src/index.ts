import express from 'express';
import dotenv from 'dotenv';
import client, { connectRedis } from './config/redis';
import { RedisCartRepository } from './adapters/out/redis/RedisCartRepository';
import { CartService } from './core/application/services/CartService';
import { CartController } from './adapters/in/http/CartController';

dotenv.config();

const app = express();
const port = process.env.CART_SERVICE_PORT || 3001;

app.use(express.json({ limit: '50mb' }));

const cartRepository = new RedisCartRepository(client);
const cartService = new CartService(cartRepository);
const cartController = new CartController(cartService);

app.get('/cart', cartController.getCart);
app.post('/cart/item', cartController.addItem);
app.delete('/cart/item/:productId', cartController.removeItemLegacy);
app.delete('/cart', cartController.clearCartLocal);

app.get('/cart/:userId', cartController.getCartParam);
app.post('/cart/:userId/item', cartController.addItemParam);
app.delete('/cart/:userId/item/:productId', cartController.removeItemParam);
app.delete('/cart/:userId', cartController.clearCartParam);

app.listen(port, async () => {
    await connectRedis();
    console.log(`Cart Service (Hexagonal TS) running on port ${port}`);
});
