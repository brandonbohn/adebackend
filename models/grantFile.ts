import mongoose, { Schema, Document } from 'mongoose';

export interface GrantFile extends Document {
  id: string;
  grantId: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: 'application' | 'report' | 'budget' | 'contract' | 'other';
  description?: string;
  uploadedAt: string;
}

const GrantFileSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  grantId: {
    type: String,
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['application', 'report', 'budget', 'contract', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    required: false
  },
  uploadedAt: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<GrantFile>('GrantFile', GrantFileSchema);
