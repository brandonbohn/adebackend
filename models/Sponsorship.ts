import mongoose, { Schema, Document } from 'mongoose';

export interface ISponsorship extends Document {
    donorId: mongoose.Types.ObjectId;
    sponsoredGirlId: mongoose.Types.ObjectId;
    paymentOptionId: mongoose.Types.ObjectId;
    startDate: Date;
    amount: number;
}

const SponsorshipSchema = new Schema<ISponsorship>({
    donorId: { type: Schema.Types.ObjectId, ref: 'Donor', required: true },
    sponsoredGirlId: { type: Schema.Types.ObjectId, ref: 'SponsoredGirl', required: true },
    paymentOptionId: { type: Schema.Types.ObjectId, ref: 'PaymentOption', required: true },
    startDate: { type: Date, required: true },
    amount: { type: Number, required: true }
});

export const SponsorshipModel = mongoose.model<ISponsorship>('Sponsorship', SponsorshipSchema);
