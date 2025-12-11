import { ICartItem } from '../models/Cart1';
import mongoose from 'mongoose';

// In-memory cart store for demonstration
type Cart = {
    _id: string;
    donorId: string;
    items: ICartItem[];
};
const carts: Cart[] = [];

export class CartService {
    static createCart(donorId: string): Cart {
        const cart: Cart = {
            _id: new mongoose.Types.ObjectId().toHexString(),
            donorId,
            items: []
        };
        carts.push(cart);
        return cart;
    }

    static getCart(cartId: string): Cart | undefined {
        return carts.find(c => c._id === cartId);
    }

    static addItemToCart(cartId: string, item: ICartItem): Cart | undefined {
        const cart = carts.find(c => c._id === cartId);
        if (cart) {
            cart.items.push(item);
            return cart;
        }
        return undefined;
    }

    static removeItemFromCart(cartId: string, itemIndex: number): Cart | undefined {
        const cart = carts.find(c => c._id === cartId);
        if (cart && itemIndex >= 0 && itemIndex < cart.items.length) {
            cart.items.splice(itemIndex, 1);
            return cart;
        }
        return undefined;
    }
}
