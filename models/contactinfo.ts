import mongoose, { Schema } from 'mongoose';

export type PreferredMethod = 'email' | 'phone' | 'none';

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  address?: string;
  preferredMethod?: PreferredMethod;
  consent?: boolean;
  tags?: string[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ContactInfoSchema = new Schema<ContactInfo>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    country: { type: String, trim: true },
    address: { type: String, trim: true },
    preferredMethod: { type: String, enum: ['email', 'phone', 'none'], default: 'email' },
    consent: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    notes: { type: String },
  },
  { timestamps: true }
);

ContactInfoSchema.index({ email: 1 }, { unique: true, sparse: true });

const ContactInfoModel = mongoose.model<ContactInfo>('ContactInfo', ContactInfoSchema);
export default ContactInfoModel;
