export type PolicyStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'expired' | 'cancelled';
export type PolicyType = 'health' | 'life' | 'vehicle' | 'home' | 'travel' | 'business';
export type ClaimStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'paid';

export interface Policy {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: PolicyType;
  status: PolicyStatus;
  premium: number;
  coverage: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
  documents: PolicyDocument[];
  beneficiaries?: string[];
  vehicleDetails?: VehicleDetails;
  healthDetails?: HealthDetails;
}

export interface PolicyDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

export interface VehicleDetails {
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  chassisNumber: string;
}

export interface HealthDetails {
  preExistingConditions: string[];
  smoker: boolean;
  height: number;
  weight: number;
  bloodGroup: string;
}

export interface Claim {
  id: string;
  policyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  description: string;
  amount: number;
  status: ClaimStatus;
  createdAt: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  paidAt?: Date;
  paidAmount?: number;
  rejectionReason?: string;
  documents: ClaimDocument[];
  incidentDate: Date;
  incidentLocation?: string;
}

export interface ClaimDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

export interface PolicyApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: PolicyType;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  premium: number;
  coverage: number;
  duration: number; // in months
  createdAt: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}
