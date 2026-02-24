import { RedisClientType } from 'redis';
import { Cart } from '../../../core/domain/Cart';
import { CartRepository } from '../../../core/application/ports/CartRepository';

const CART_TTL = 86400; // 24 hours

export class RedisCartRepository implements CartRepository {
    constructor(private readonly redisClient: RedisClientType<any, any, any>) {}

    async getCart(userId: string): Promise<Cart | null> {
        const cartJson = await this.redisClient.get(`cart:${userId}`);
        if (!cartJson) {
            return null;
        }
        
        const parsed = JSON.parse(cartJson);
        return new Cart(parsed.userId, parsed.items || [], parsed.totalPrice || 0);
    }

    async saveCart(cart: Cart): Promise<void> {
        await this.redisClient.set(`cart:${cart.userId}`, JSON.stringify(cart), {
            EX: CART_TTL
        });
    }

    async clearCart(userId: string): Promise<void> {
        await this.redisClient.del(`cart:${userId}`);
    }
}
