import mongoose, { Schema, Document } from 'mongoose';

export interface TeamMember extends Document {
  id: string;
  fullName: string;
  roleType: 'employee' | 'volunteer';
  roleTitle: string;
  startDate: string;
  status: 'active' | 'inactive';
  phone: string;
  email: string;
  program?: string;
  notes?: string;
}

const TeamMemberSchema: Schema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  roleType: {
    type: String,
    required: true,
    enum: ['employee', 'volunteer'],
    default: 'employee'
  },
  roleTitle: {
    type: String,
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  program: {
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

export default mongoose.model<TeamMember>('TeamMember', TeamMemberSchema);
