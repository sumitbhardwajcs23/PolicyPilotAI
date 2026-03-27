import mongoose, { Schema, Document } from 'mongoose';

export interface IClaim extends Document {
  policyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  triggerType: 'heavy_rain' | 'extreme_heat' | 'severe_pollution' | 'flooding' | 'social_disruption';
  triggerDescription?: string;
  eventTimestamp: Date;
  location: any;
  payoutAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'paid';
  fraudScore: number;
  evidence: unknown[];
  createdAt: Date;
  processedAt?: Date;
  paidAt?: Date;
}

const claimSchema = new Schema<IClaim>({
  policyId: { type: Schema.Types.ObjectId, ref: 'Policy', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  triggerType: { 
    type: String, 
    enum: ['heavy_rain', 'extreme_heat', 'severe_pollution', 'flooding', 'social_disruption'], 
    required: true,
    index: true
  },
  triggerDescription: { type: String },
  eventTimestamp: { type: Date, required: true },
  location: { 
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } 
  },
  payoutAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'processing', 'paid'], 
    default: 'pending', 
    required: true,
    index: true
  },
  fraudScore: { type: Number, default: 0, required: true },
  evidence: { type: Array, default: [] },
  processedAt: { type: Date },
  paidAt: { type: Date }
}, {
  timestamps: true
});

claimSchema.index({ userId: 1, status: 1 });
claimSchema.index({ location: '2dsphere' });

export const Claim = mongoose.model<IClaim>('Claim', claimSchema);
