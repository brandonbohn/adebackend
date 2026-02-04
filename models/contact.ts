// File-based types (kept for backward compatibility while migrating controllers)
export interface IContact {
  _id: string;
  name: string;
  organization?: string;
  email: string;
  phone?: string;
  reason: 'volunteering' | 'donation' | 'partnership' | 'general' | 'other';
  subject: string;
  message: string;
  status?: 'new' | 'responded' | 'closed';
  respondedAt?: string;
  respondedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContactSummary {
  _id: string;
  name: string;
  email: string;
  reason: string;
  subject: string;
  status: string;
  createdAt: string;
}

// Mongo model for contact submissions (DRY with ContactInfo)
import mongoose, { Schema, Types } from 'mongoose';

export type ContactReason = 'volunteering' | 'donation' | 'partnership' | 'general' | 'other';
export type ContactStatus = 'new' | 'responded' | 'closed';

export interface ContactDoc {
  contactid: Types.ObjectId; // ref ContactInfo
  organization?: string;
  reason: ContactReason;
  subject: string;
  message: string;
  status?: ContactStatus;
  respondedAt?: Date;
  respondedBy?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ContactSchema = new Schema<ContactDoc>(
  {
    contactid: { type: Schema.Types.ObjectId, ref: 'ContactInfo', required: true },
    organization: { type: String, trim: true },
    reason: { type: String, enum: ['volunteering', 'donation', 'partnership', 'general', 'other'], default: 'general' },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['new', 'responded', 'closed'], default: 'new' },
    respondedAt: { type: Date },
    respondedBy: { type: String, trim: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const ContactModel = mongoose.model<ContactDoc>('Contact', ContactSchema);
