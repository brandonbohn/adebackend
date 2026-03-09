import mongoose, { Schema, Document } from 'mongoose';

export interface Budget extends Document {
  id: string;
  name: string;
  amount: number;
  allocated: number;
  remaining: number;
  year: number;
  category: string;
  description: string;
  createdDate: string;
}

const BudgetSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  allocated: {
    type: Number,
    default: 0
  },
  remaining: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdDate: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<Budget>('Budget', BudgetSchema);
