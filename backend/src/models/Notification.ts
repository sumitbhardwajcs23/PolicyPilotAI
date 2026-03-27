import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true },
  type: { type: String, required: true, maxlength: 50, index: true },
  read: { type: Boolean, default: false, required: true, index: true },
  actionUrl: { type: String, maxlength: 500 },
}, {
  timestamps: true
});

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
