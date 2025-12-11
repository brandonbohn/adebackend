import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentOption extends Document {
    type: 'mpesa' | 'paypal' | 'flutterwave' | 'other';
    label: string;
    description?: string;
}

const PaymentOptionSchema = new Schema<IPaymentOption>({
    type: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String }
});

export const PaymentOptionModel = mongoose.model<IPaymentOption>('PaymentOption', PaymentOptionSchema);
