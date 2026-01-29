export interface CartItem {
    productId: string;
    quantity: number;
    name: string;
    price: number;
}

export interface Cart {
    userId: string;
    items: CartItem[];
    totalPrice: number;
}
