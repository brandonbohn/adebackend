import { ICart } from './Cart1';
import mongoose, { Schema, Document } from 'mongoose';


export interface IDonor extends Document {
    name: string;
    amount: number;
    country: string;
    donationDate: Date;
    donations: any[];
   
}
const DonorSchema: Schema = new Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },

    country: { type: String, required: true },
    donationDate: { type: Date, default: Date.now },
    donations: { type: [Schema.Types.Mixed], default: [] },
});

export const DonorModel = mongoose.model<IDonor>('Donor', DonorSchema);


    

    
export interface Donation {
    donorId: mongoose.Types.ObjectId;
    amount: number;
    date: Date;
    message?: string;
    }
    
