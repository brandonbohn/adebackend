import mongoose, { Schema, Document } from 'mongoose';

export interface Participant extends Document {
  id: string;
  fullName: string;
  programId: string;
  programName: string;
  category: 'girl' | 'boy' | 'youth' | 'adult' | 'household' | 'other';
  gender: 'female' | 'male' | 'other';
  age?: number;
  status: 'active' | 'inactive' | 'completed';
  guardianName?: string;
  phone?: string;
  location?: string;
  notes?: string;
}

const ParticipantSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  programId: {
    type: String,
    required: true
  },
  programName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['girl', 'boy', 'youth', 'adult', 'household', 'other'],
    default: 'other'
  },
  gender: {
    type: String,
    required: true,
    enum: ['female', 'male', 'other'],
    default: 'female'
  },
  age: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  guardianName: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.model<Participant>('Participant', ParticipantSchema);
