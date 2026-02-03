
import mongoose, { Schema,} from 'mongoose';


export interface Donors {

    email?: string;
    phone?: string;
    contactid: string;    
    name: string;
    country: string;
    pastDonations?: any[];
    source?: string;
    notes?: string;

}    
    
   
const DonorsSchema: Schema = new Schema({
    name: { type: String, required: true },
    country: { type: String, required: true },
    contactid: { type: String, required: true },
    pastDonations: { type: [Schema.Types.Mixed], default: [] },
    source: { type: String },
    notes: { type: String },
    email: { type: String },
     phone: { type: String },
   });

export const DonorsModel = mongoose.model<Donors>('Donors', DonorsSchema);


    

export default DonorsModel;
    
