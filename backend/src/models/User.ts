import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName?: string;
  lastName?: string;
  name: string;
  email?: string;
  mobile?: string;
  dob?: Date;
  role: 'worker' | 'admin' | 'insurer';
  adminType?: 'master' | 'slave';   // only relevant when role === 'admin' or 'insurer'
  permissions?: string[];            // granted by master admin to slave admins
  platform?: string;
  zone?: string;
  upiId?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  lastLocation?: { lat: number; lng: number };
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, maxlength: 60 },
  lastName:  { type: String, maxlength: 60 },
  name:      { type: String, required: true, maxlength: 120 },
  email:     { type: String, maxlength: 255, unique: true, sparse: true, lowercase: true, trim: true },
  mobile:    { type: String, maxlength: 15,  unique: true, sparse: true, trim: true },
  dob:       { type: Date },
  role:          { type: String, enum: ['worker', 'admin', 'insurer'], default: 'worker', required: true, index: true },
  adminType:     { type: String, enum: ['master', 'slave'] },
  permissions:   { type: [String], default: [] },
  platform:      { type: String, maxlength: 20 },
  zone:          { type: String, maxlength: 100 },
  upiId:         { type: String, maxlength: 100 },
  kycStatus:     { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', required: true, index: true },
  emailVerified: { type: Boolean, default: false },
  isActive:      { type: Boolean, default: true },
  lastLoginAt:   { type: Date },
  lastLocation:  {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { 
  timestamps: true 
});

// Compound index for searching users in a zone by role
userSchema.index({ zone: 1, role: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
