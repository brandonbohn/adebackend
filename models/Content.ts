import mongoose, { Schema } from 'mongoose';

export interface Content {
  key: string;
  data: any;
  updatedAt?: Date;
}

const ContentSchema = new Schema<Content>({
  key: { type: String, required: true, unique: true },
  data: { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const ContentModel = mongoose.model<Content>('Content', ContentSchema);
export default ContentModel;
