import mongoose, { Schema } from 'mongoose';

export enum BasedIn {
    nairobi = 'nairobi',
    kenya = 'kenya',
    remote = 'remote',
}

export enum VolunteerStatus {
    pending = 'pending',
    approved = 'approved',
    rejected = 'rejected',
    inactive = 'inactive',
}





export interface Volunteer {
    _id?: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    contactid: string;
    basedIn: BasedIn;
    availability?: string;
    interests: string[];
    otherInterest?: string;
    experience?: string;
    languagesSpoken?: string[];
    createdAt?: Date;
    status: VolunteerStatus;
}




const VolunteerSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    location: { type: String, required: true },
    contactid: { type: Schema.Types.ObjectId, ref: 'ContactInfo', required: true },
    basedIn: { type: String, enum: Object.values(BasedIn), required: true },
    availability: { type: String },
    interests: { type: [String], required: true },
    otherInterest: { type: String },
    experience: { type: String },
    languagesSpoken: { type: [String] },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: Object.values(VolunteerStatus), default: VolunteerStatus.pending },
    source: { type: String },
    notes: { type: String },
    
   });

const VolunteerModel = mongoose.model<Volunteer>('Volunteer', VolunteerSchema);


    

export default VolunteerModel;
    
