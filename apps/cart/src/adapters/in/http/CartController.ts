import { Request, Response } from 'express';
import { CartService } from '../../../core/application/services/CartService';
import { Cart, CartItem } from '../../../core/domain/Cart';

export class CartController {
    constructor(private readonly cartService: CartService) {}

    private getUserId(req: Request): string | undefined {
        return req.headers['x-user-id'] as string;
    }

    public getCart = async (req: Request, res: Response) => {
        const userId = this.getUserId(req);
        if (!userId) return res.status(401).json({ error: 'User ID missing in headers' });
        try {
            const cart = await this.cartService.getCart(userId);
            res.json(this.mapToResponse(cart));
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public addItem = async (req: Request, res: Response) => {
        const userId = this.getUserId(req);
        if (!userId) return res.status(401).json({ error: 'User ID missing in headers' });
        try {
            const itemRequest = req.body;
            const cartItem: CartItem = {
                ...itemRequest,
                price: Math.round(itemRequest.price * 100)
            };

            const cart = await this.cartService.addItem(userId, cartItem);
            res.json(this.mapToResponse(cart));
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public removeItemLegacy = async (req: Request, res: Response) => {
        const userId = this.getUserId(req);
        if (!userId) return res.status(401).json({ error: 'User ID missing in headers' });
        try {
            const { size, color } = req.query;
            const cart = await this.cartService.removeItem(
                userId, 
                req.params.productId, 
                size as string, 
                color as string
            );
            res.json(this.mapToResponse(cart));
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public clearCartLocal = async (req: Request, res: Response) => {
        const userId = this.getUserId(req);
        if (!userId) return res.status(401).json({ error: 'User ID missing in headers' });
        try {
            await this.cartService.clearCart(userId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public getCartParam = async (req: Request, res: Response) => {
        try {
            const cart = await this.cartService.getCart(req.params.userId);
            res.json(this.mapToResponse(cart));
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public addItemParam = async (req: Request, res: Response) => {
        try {
            const itemRequest = req.body;
            const cartItem: CartItem = {
                ...itemRequest,
                price: Math.round(itemRequest.price * 100)
            };

            const cart = await this.cartService.addItem(req.params.userId, cartItem);
            res.json(this.mapToResponse(cart));
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public removeItemParam = async (req: Request, res: Response) => {
        try {
            const cart = await this.cartService.removeItem(req.params.userId, req.params.productId);
            res.json(this.mapToResponse(cart));
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public clearCartParam = async (req: Request, res: Response) => {
        try {
            await this.cartService.clearCart(req.params.userId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    private mapToResponse(cart: Cart) {
        return {
            userId: cart.userId,
            items: cart.items.map(item => ({
                ...item,
                price: item.price / 100.0
            })),
            totalPrice: cart.totalPrice / 100.0
        };
    }
}
