import mongoose, { Schema, Document } from 'mongoose';

export interface Team extends Document {
  id: string;
  name: string;
  description: string;
  coach: string;
  category: string;
  status: string;
  createdDate: string;
}

const TeamSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  coach: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: 'active'
  },
  createdDate: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<Team>('Team', TeamSchema);
