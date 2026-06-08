import mongoose, { Schema, Document } from 'mongoose';

export interface GrantRequirement {
  id: string;
  label: string;
  completed: boolean;
  dueDate?: string;
}

export interface Grant extends Document {
  id: string;
  title: string;
  funder: string;
  company?: string;
  sourceUrl?: string;
  researchDate?: string;
  deadline?: string;
  nextActionDate?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  amountAwarded: number;
  amountReceived: number;
  startDate?: string;
  endDate?: string;
  status: string;
  purpose?: string;
  requirements: GrantRequirement[];
  notes?: string;
  createdDate: string;
  fileIds?: string[];
}

const GrantRequirementSchema: Schema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  completed: { type: Boolean, required: true, default: false },
  dueDate: { type: String, required: false }
});

const GrantSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  funder: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: false
  },
  sourceUrl: {
    type: String,
    required: false
  },
  researchDate: {
    type: String,
    required: false
  },
  deadline: {
    type: String,
    required: false
  },
  nextActionDate: {
    type: String,
    required: false
  },
  contactName: {
    type: String,
    required: false
  },
  contactEmail: {
    type: String,
    required: false
  },
  contactPhone: {
    type: String,
    required: false
  },
  amountAwarded: {
    type: Number,
    required: true,
    default: 0
  },
  amountReceived: {
    type: Number,
    required: true,
    default: 0
  },
  startDate: {
    type: String,
    required: false
  },
  endDate: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: true,
    default: 'pipeline'
  },
  purpose: {
    type: String,
    required: false
  },
  requirements: {
    type: [GrantRequirementSchema],
    default: []
  },
  notes: {
    type: String,
    required: false
  },
  createdDate: {
    type: String,
    required: true
  },
  fileIds: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.model<Grant>('Grant', GrantSchema);
