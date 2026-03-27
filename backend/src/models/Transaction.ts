import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  policyId?: mongoose.Types.ObjectId;
  claimId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  type: 'premium_payment' | 'claim_payout' | 'refund' | 'adjustment';
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  paymentMethod?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  description?: string;
  metadata?: Record<string, any>;
}

const transactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  policyId: { type: Schema.Types.ObjectId, ref: 'Policy', index: true },
  claimId: { type: Schema.Types.ObjectId, ref: 'Claim', index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR', required: true },
  type: { 
    type: String, 
    enum: ['premium_payment', 'claim_payout', 'refund', 'adjustment'], 
    required: true,
    index: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'reversed'], 
    default: 'pending', 
    required: true,
    index: true
  },
  paymentMethod: { type: String },
  razorpayPaymentId: { type: String, unique: true, sparse: true },
  razorpayOrderId: { type: String, unique: true, sparse: true },
  razorpaySignature: { type: String },
  description: { type: String },
  metadata: { type: Schema.Types.Mixed },
}, {
  timestamps: true
});

transactionSchema.index({ userId: 1, type: 1, status: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
