import mongoose, { Schema, Document } from 'mongoose';

export interface ISponsoredGirl extends Document {
    name: string;
    country: string;
    sponsorshipStartDate: Date;
    sponsors: mongoose.Types.ObjectId[];
}

const SponsoredGirlSchema = new Schema<ISponsoredGirl>({
    name: { type: String, required: true },
    country: { type: String, required: true },
    sponsorshipStartDate: { type: Date, required: true },
    sponsors: [{ type: Schema.Types.ObjectId, ref: 'Donor' }]
});

export const SponsoredGirlModel = mongoose.model<ISponsoredGirl>('SponsoredGirl', SponsoredGirlSchema);
