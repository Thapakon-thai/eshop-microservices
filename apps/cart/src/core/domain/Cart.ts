export interface CartItem {
    productId: string;
    quantity: number;
    name: string;
    price: number;
    selectedSize?: string;
    selectedColor?: string;
    image?: string;
}

export class Cart {
    constructor(
        public userId: string,
        public items: CartItem[] = [],
        public totalPrice: number = 0
    ) {}

    calculateTotal(): void {
        this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    validate(): void {
        if (!this.userId) {
            throw new Error("Cart must have an associated User ID");
        }
        if (this.totalPrice < 0) {
            throw new Error("Cart total cannot be negative");
        }
        for (const item of this.items) {
            if (item.quantity <= 0) {
                throw new Error("Cart item quantity must be greater than zero");
            }
            if (item.price < 0) {
                throw new Error("Cart item price cannot be negative");
            }
        }
    }
}
