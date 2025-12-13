"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeItemFromCart = exports.addItemToCart = exports.getCart = exports.createCart = void 0;
const cartService_1 = require("../services/cartService");
// In-memory cart store for demonstration (replace with DB logic as needed)
// const carts: Cart[] = [];
const createCart = (req, res) => {
    const { donorId } = req.body;
    if (!donorId) {
        return res.status(400).json({ error: 'donorId is required' });
    }
    const cart = cartService_1.CartService.createCart(donorId);
    res.status(201).json(cart);
};
exports.createCart = createCart;
const getCart = (req, res) => {
    const cartId = req.params.id;
    const cart = cartService_1.CartService.getCart(cartId);
    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }
    res.json(cart);
};
exports.getCart = getCart;
const addItemToCart = (req, res) => {
    const cartId = req.params.id;
    const item = req.body;
    const updatedCart = cartService_1.CartService.addItemToCart(cartId, item);
    if (!updatedCart) {
        return res.status(404).json({ error: 'Cart not found' });
    }
    res.status(201).json(updatedCart);
};
exports.addItemToCart = addItemToCart;
const removeItemFromCart = (req, res) => {
    const cartId = req.params.id;
    const itemIndex = parseInt(req.params.itemIndex);
    const updatedCart = cartService_1.CartService.removeItemFromCart(cartId, itemIndex);
    if (!updatedCart) {
        return res.status(404).json({ error: 'Cart not found or invalid item index' });
    }
    res.json(updatedCart);
};
exports.removeItemFromCart = removeItemFromCart;
