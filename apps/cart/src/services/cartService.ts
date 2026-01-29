import client from '../config/redis';
import { Cart, CartItem } from '../models/cart';

const CART_TTL = 86400; // 24 hours

export class CartService {
    static async getCart(userId: string): Promise<Cart | null> {
        const cartJson = await client.get(`cart:${userId}`);
        if (!cartJson) {
            return { userId, items: [], totalPrice: 0 };
        }
        return JSON.parse(cartJson);
    }

    static async addItem(userId: string, item: CartItem): Promise<Cart> {
        let cart = await this.getCart(userId);
        if (!cart) {
            cart = { userId, items: [], totalPrice: 0 };
        }

        const existingItemIndex = cart.items.findIndex(i => 
            i.productId === item.productId && 
            i.selectedSize === item.selectedSize && 
            i.selectedColor === item.selectedColor
        );
        
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += item.quantity;
        } else {
            cart.items.push(item);
        }

        this.calculateTotal(cart);
        await this.saveCart(userId, cart);
        return cart;
    }

    static async removeItem(userId: string, productId: string, selectedSize?: string, selectedColor?: string): Promise<Cart> {
        const cart = await this.getCart(userId);
        if (!cart) return { userId, items: [], totalPrice: 0 };

        cart.items = cart.items.filter(item => {
            // Keep item if productId doesn't match
            if (item.productId !== productId) return true;
            
            // If productId matches, check variants (if provided)
            // If size/color provided, only remove if they match. 
            // If not provided, remove all of that productId (legacy behavior or bulk remove)? 
            // Let's assume strict matching if provided.
            
            const sizeMatches = !selectedSize || item.selectedSize === selectedSize;
            const colorMatches = !selectedColor || item.selectedColor === selectedColor;

            // If everything matches, we want to REMOVE it (return false)
            if (sizeMatches && colorMatches) return false;

            return true;
        });
        
        this.calculateTotal(cart);
        await this.saveCart(userId, cart);
        return cart;
    }

    static async clearCart(userId: string): Promise<void> {
        await client.del(`cart:${userId}`);
    }

    private static calculateTotal(cart: Cart) {
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    private static async saveCart(userId: string, cart: Cart) {
        await client.set(`cart:${userId}`, JSON.stringify(cart), {
            EX: CART_TTL
        });
    }
}
