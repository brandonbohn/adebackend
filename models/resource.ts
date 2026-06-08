import mongoose, { Schema, Document } from 'mongoose';

export interface Resource extends Document {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: 'starter-kit' | 'template' | 'guide' | 'policy' | 'other';
  title: string;
  description?: string;
  uploadedAt: string;
}

const ResourceSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
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
  category: {
    type: String,
    required: true,
    enum: ['starter-kit', 'template', 'guide', 'policy', 'other'],
    default: 'other'
  },
  title: {
    type: String,
    required: true
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

export default mongoose.model<Resource>('Resource', ResourceSchema);
