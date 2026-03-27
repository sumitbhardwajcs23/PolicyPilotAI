// Shared TypeScript types for PolicyPilotAI Platform

export type UserRole = 'worker' | 'admin' | 'insurer';

export interface User {
  id: string;
  mobile: string;
  name: string;
  email?: string;
  role: UserRole;
  platform: 'zomato' | 'swiggy' | 'both';
  zone: string;
  upiId: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  lastLoginAt: string;
}

export interface Policy {
  id: string;
  userId: string;
  tier: 'basic' | 'standard' | 'premium';
  weeklyPremium: number;
  maxCoverage: number;
  eventsPerWeek: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  autoRenewal: boolean;
  coverageUsed: number;
  coverageRemaining: number;
}

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'paid';
export type TriggerType = 'heavy_rain' | 'extreme_heat' | 'severe_pollution' | 'flooding' | 'social_disruption';

export interface Claim {
  id: string;
  policyId: string;
  userId: string;
  triggerType: TriggerType;
  triggerDescription: string;
  eventTimestamp: string;
  location: {
    lat: number;
    lng: number;
    zone: string;
  };
  payoutAmount: number;
  status: ClaimStatus;
  fraudScore: number;
  createdAt: string;
  processedAt?: string;
  paidAt?: string;
  evidence?: string[];
}

export interface DashboardStats {
  activePolicies: number;
  totalClaims: number;
  totalPayouts: number;
  avgProcessingTime: number;
  fraudDetectionRate: number;
  lossRatio: number;
}

export interface WorkerStats {
  activePolicy: Policy | null;
  totalClaimsThisMonth: number;
  totalPayoutsThisMonth: number;
  incomeProtected: number;
  upcomingRenewalDate?: string;
  weeklyRiskScore: number;
}

export interface RiskForecast {
  date: string;
  riskLevel: 'low' | 'medium' | 'high' | 'severe';
  riskType?: TriggerType;
  description: string;
  suggestedAction: string;
}

export interface PremiumCalculation {
  basePremium: number;
  geographicRisk: number;
  temporalRisk: number;
  loyaltyDiscount: number;
  finalPremium: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'claim_approved' | 'claim_paid' | 'policy_expiring' | 'risk_alert' | 'payment_failed' | 'general';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'netbanking';
  details: {
    upiId?: string;
    last4?: string;
    bankName?: string;
  };
  isDefault: boolean;
}

export interface FraudAnalysis {
  claimId: string;
  riskScore: number;
  factors: {
    gpsValid: boolean;
    weatherCorrelated: boolean;
    behavioralAnomaly: boolean;
    platformVerified: boolean;
  };
  confidence: number;
}

export interface ZoneRiskProfile {
  zone: string;
  riskScore: number;
  primaryRisks: TriggerType[];
  avgClaimsPerMonth: number;
  avgPayoutAmount: number;
  seasonalMultiplier: number;
}

export interface ParametricEvent {
  id: string;
  type: TriggerType;
  zone: string;
  intensity: number;
  threshold: number;
  startTime: string;
  endTime?: string;
  affectedWorkers: number;
  totalEstimatedPayout: number;
  status: 'active' | 'resolved' | 'cancelled';
}
export interface AirQualityData {
  aqi: number;
  pm2_5: number;
  pm10: number;
  ozone: number;
  no2: number;
  so2: number;
  co: number;
  uvIndex: number;
  ammonia?: number;
  dust?: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainfall?: number;
  icon: string;
  airQuality?: AirQualityData;
  alerts?: WeatherAlert[];
}

export interface WeatherAlert {
  id: string;
  event: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  start: Date;
  end: Date;
}

export interface ForecastDay {
  date: Date;
  tempMin: number;
  tempMax: number;
  condition: string;
  icon: string;
  rainfall: number;
}
