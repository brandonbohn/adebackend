import mongoose, { Schema, Document } from 'mongoose';

export interface ISponsorship extends Document {
    donorId: mongoose.Types.ObjectId;
    sponsoredGirlId: mongoose.Types.ObjectId;
    sponsorshipLevel: 'starter' | 'basic' | 'full' | 'premium';
    cadence: 'monthly' | 'annual' | 'one_time';
    status: 'active' | 'paused' | 'cancelled';
    startDate: Date;
    endDate?: Date;
    amount: number;
    source?: string;
    notes?: string;
}

const SponsorshipSchema = new Schema<ISponsorship>({
    donorId: { type: Schema.Types.ObjectId, ref: 'Donors', required: true },
    sponsoredGirlId: { type: Schema.Types.ObjectId, ref: 'SponsoredGirl', required: true },
    sponsorshipLevel: { type: String, enum: ['starter', 'basic', 'full', 'premium'], required: true },
    cadence: { type: String, enum: ['monthly', 'annual', 'one_time'], default: 'monthly' },
    status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    amount: { type: Number, required: true },
    source: { type: String },
    notes: { type: String },
}, { timestamps: true });

SponsorshipSchema.index(
    { donorId: 1, sponsoredGirlId: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'active' } }
);

export const SponsorshipModel = mongoose.model<ISponsorship>('Sponsorship', SponsorshipSchema);
