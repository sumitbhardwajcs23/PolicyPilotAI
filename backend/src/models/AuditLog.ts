import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;
  targetId?: mongoose.Types.ObjectId;
  targetModel?: 'User' | 'Policy' | 'Claim' | 'ParametricEvent';
  action: string;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const auditLogSchema = new Schema<IAuditLog>({
  actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetId: { type: Schema.Types.ObjectId, index: true },
  targetModel: { 
    type: String, 
    enum: ['User', 'Policy', 'Claim', 'ParametricEvent'], 
    index: true 
  },
  action: { type: String, required: true, index: true },
  changes: { 
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed
  },
  ipAddress: { type: String },
  userAgent: { type: String },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'low', 
    required: true,
    index: true
  },
}, {
  timestamps: true // This will provide 'createdAt' as the event time
});

auditLogSchema.index({ actorId: 1, action: 1 });
auditLogSchema.index({ targetModel: 1, targetId: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
