import { Request, Response } from 'express';
import { ICartItem } from '../models/Cart1';
import { CartService } from '../services/cartService';

// In-memory cart store for demonstration (replace with DB logic as needed)
// const carts: Cart[] = [];

export const createCart = (req: Request, res: Response) => {
    const { donorId } = req.body;
    if (!donorId) {
        return res.status(400).json({ error: 'donorId is required' });
    }
        const cart = CartService.createCart(donorId);
    res.status(201).json(cart);
};

export const getCart = (req: Request, res: Response) => {
    const cartId = req.params.id;
    const cart = CartService.getCart(cartId);
    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(cart);
};

export const addItemToCart = (req: Request, res: Response) => {
    const cartId = req.params.id;
    const item: ICartItem = req.body;
    const updatedCart = CartService.addItemToCart(cartId, item);
    if (!updatedCart) {
        return res.status(404).json({ error: 'Cart not found' });
    }
    res.status(201).json(updatedCart);
};

export const removeItemFromCart = (req: Request, res: Response) => {
    const cartId = req.params.id;
    const itemIndex = parseInt(req.params.itemIndex);
    const updatedCart = CartService.removeItemFromCart(cartId, itemIndex);
    if (!updatedCart) {
        return res.status(404).json({ error: 'Cart not found or invalid item index' });
    }
    res.json(updatedCart);
};
