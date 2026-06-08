import mongoose, { Schema, Document } from 'mongoose';

export interface Grant extends Document {
  id: string;
  name: string;
  organization: string;
  amount: number;
  currency: string;
  applicationDate: string;
  deadline: string;
  description: string;
  status: string;
  createdDate: string;
}

const GrantSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  applicationDate: {
    type: String,
    required: true
  },
  deadline: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'applied'
  },
  createdDate: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<Grant>('Grant', GrantSchema);
