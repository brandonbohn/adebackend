"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const carts = [];
class CartService {
    static createCart(donorId) {
        const cart = {
            _id: new mongoose_1.default.Types.ObjectId().toHexString(),
            donorId,
            items: []
        };
        carts.push(cart);
        return cart;
    }
    static getCart(cartId) {
        return carts.find(c => c._id === cartId);
    }
    static addItemToCart(cartId, item) {
        const cart = carts.find(c => c._id === cartId);
        if (cart) {
            cart.items.push(item);
            return cart;
        }
        return undefined;
    }
    static removeItemFromCart(cartId, itemIndex) {
        const cart = carts.find(c => c._id === cartId);
        if (cart && itemIndex >= 0 && itemIndex < cart.items.length) {
            cart.items.splice(itemIndex, 1);
            return cart;
        }
        return undefined;
    }
}
exports.CartService = CartService;
