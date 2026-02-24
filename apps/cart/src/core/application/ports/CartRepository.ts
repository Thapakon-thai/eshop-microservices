import { Cart } from "../../domain/Cart";

export interface CartRepository {
    getCart(userId: string): Promise<Cart | null>;
    saveCart(cart: Cart): Promise<void>;
    clearCart(userId: string): Promise<void>;
}
