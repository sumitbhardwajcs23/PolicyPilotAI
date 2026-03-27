import mongoose, { Schema, Document } from 'mongoose';

export interface IParametricEvent extends Document {
  type: 'heavy_rain' | 'extreme_heat' | 'severe_pollution' | 'flooding' | 'social_disruption';
  zone: string;
  intensity: number;
  threshold: number;
  startTime: Date;
  endTime?: Date;
  affectedWorkers: number;
  totalEstimatedPayout: number;
  status: string;
  createdAt: Date;
}

const parametricEventSchema = new Schema<IParametricEvent>({
  type: { 
    type: String, 
    enum: ['heavy_rain', 'extreme_heat', 'severe_pollution', 'flooding', 'social_disruption'], 
    required: true,
    index: true
  },
  zone: { type: String, required: true, maxlength: 100, index: true },
  intensity: { type: Number, required: true },
  threshold: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  affectedWorkers: { type: Number, default: 0, required: true },
  totalEstimatedPayout: { type: Number, default: 0, required: true },
  status: { type: String, default: 'active', maxlength: 20, required: true, index: true },
}, {
  timestamps: true
});

export const ParametricEvent = mongoose.model<IParametricEvent>('ParametricEvent', parametricEventSchema);
