import mongoose, { Schema } from 'mongoose';

enum DonationType {
    general = 'general',
    annualsponsorship = 'recurring',
    weeklysponsorship = 'weekly',
    onetimesponsorship = 'onetime',
    specialproject = 'specialproject',
}

export interface Donation {
    amount: number;
    date: Date;
    donationType: DonationType;
    message?: string;
    currency: string;
    donorid?: mongoose.Types.ObjectId;
}

const DonationSchema: Schema = new Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    donationType: { type: String, enum: Object.values(DonationType), required: true },
    message: { type: String },
    currency: { type: String, required: true },
    donorid: { type: Schema.Types.ObjectId, ref: 'Donor' },
});
export const DonationModel = mongoose.model<Donation>('Donation', DonationSchema);

export default DonationModel;