import mongoose, { Schema, Document } from 'mongoose';

export interface ISponsoredGirl extends Document {
    name: string;
    age?: string;
    dream?: string;
    description?: string;
    sentenceInTheirWords?: string;
    situation?: string;
    image?: string;
    status?: string;
    country: string;
    sponsorshipStartDate: Date;
    sponsors: mongoose.Types.ObjectId[];
}

const SponsoredGirlSchema = new Schema<ISponsoredGirl>({
    name: { type: String, required: true },
    age: { type: String },
    dream: { type: String },
    description: { type: String },
    sentenceInTheirWords: { type: String },
    situation: { type: String },
    image: { type: String },
    status: { type: String, default: 'Available for Sponsorship' },
    country: { type: String, required: true },
    sponsorshipStartDate: { type: Date, default: Date.now },
    sponsors: [{ type: Schema.Types.ObjectId, ref: 'Donors' }]
}, { timestamps: true });

export const SponsoredGirlModel = mongoose.model<ISponsoredGirl>('SponsoredGirl', SponsoredGirlSchema);
