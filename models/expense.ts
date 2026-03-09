import mongoose, { Schema, Document } from 'mongoose';

export interface Expense extends Document {
  id: string;
  programId: string;
  programName: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  receipt: string;
  approvedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  vendor?: string;
  receiptNumber?: string;
  paymentMethod?: string;
  notes?: string;
}

const ExpenseSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  programId: {
    type: String,
    required: true
  },
  programName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  receipt: {
    type: String,
    required: true
  },
  approvedBy: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  vendor: String,
  receiptNumber: String,
  paymentMethod: String,
  notes: String
}, {
  timestamps: true
});

export default mongoose.model<Expense>('Expense', ExpenseSchema);
