export interface CartItem {
    productId: string;
    quantity: number;
    name: string;
    price: number;
    selectedSize?: string;
    selectedColor?: string;
    image?: string;
}

export interface Cart {
    userId: string;
    items: CartItem[];
    totalPrice: number;
}
