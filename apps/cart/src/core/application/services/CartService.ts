import { Cart, CartItem } from "../../domain/Cart";
import { CartRepository } from "../ports/CartRepository";

export class CartService {
    constructor(private readonly cartRepository: CartRepository) {}

    async getCart(userId: string): Promise<Cart> {
        const cart = await this.cartRepository.getCart(userId);
        return cart || new Cart(userId);
    }

    async addItem(userId: string, item: CartItem): Promise<Cart> {
        let cart = await this.getCart(userId);

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

        cart.calculateTotal();
        cart.validate(); // Enforce Domain purity prior to Dispatch
        
        await this.cartRepository.saveCart(cart);
        return cart;
    }

    async removeItem(userId: string, productId: string, selectedSize?: string, selectedColor?: string): Promise<Cart> {
        const cart = await this.getCart(userId);

        cart.items = cart.items.filter(item => {
            if (item.productId !== productId) return true;
            
            const sizeMatches = !selectedSize || item.selectedSize === selectedSize;
            const colorMatches = !selectedColor || item.selectedColor === selectedColor;

            if (sizeMatches && colorMatches) return false;
            return true;
        });
        
        cart.calculateTotal();
        cart.validate();
        
        await this.cartRepository.saveCart(cart);
        return cart;
    }

    async clearCart(userId: string): Promise<void> {
        await this.cartRepository.clearCart(userId);
    }
}
