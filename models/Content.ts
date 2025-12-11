import mongoose, { Schema, Document } from 'mongoose';

export interface IContent extends Document {
  title: string;
  body: string;
  images: string[]; // URLs or file paths
  section: string; // e.g., 'home', 'about', 'donate'
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>({
  title: { type: String, required: true },
  body: { type: String, required: true },
  images: { type: [String], default: [] },
  section: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ContentModel = mongoose.model<IContent>('Content', ContentSchema);
