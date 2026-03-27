import mongoose, { Schema, Document } from 'mongoose';

export interface IPolicy extends Document {
  userId: mongoose.Types.ObjectId;
  tier: 'basic' | 'standard' | 'premium';
  weeklyPremium: number;
  maxCoverage: number;
  eventsPerWeek: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  autoRenewal: boolean;
  coverageUsed: number;
  coverageRemaining: number;
  createdAt: Date;
}

const policySchema = new Schema<IPolicy>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tier: { type: String, enum: ['basic', 'standard', 'premium'], required: true },
  weeklyPremium: { type: Number, required: true },
  maxCoverage: { type: Number, required: true },
  eventsPerWeek: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled', 'pending'], default: 'pending', required: true, index: true },
  autoRenewal: { type: Boolean, default: false, required: true },
  coverageUsed: { type: Number, default: 0, required: true },
  coverageRemaining: { type: Number, required: true },
}, {
  timestamps: true
});

policySchema.index({ userId: 1, status: 1 });

export const Policy = mongoose.model<IPolicy>('Policy', policySchema);
