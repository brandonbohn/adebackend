 

import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    amount: number;
    description?: string;
}

export interface ICart extends Document {
    donorId: mongoose.Types.ObjectId;
    items: ICartItem[];
}

const CartItemSchema = new Schema<ICartItem>({
    productId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
    description: { type: String }
});

const CartSchema = new Schema<ICart>({
    donorId: { type: Schema.Types.ObjectId, ref: 'Donor', required: true },
    items: { type: [CartItemSchema], default: [] }
});

export const CartModel = mongoose.model<ICart>('Cart', CartSchema);

