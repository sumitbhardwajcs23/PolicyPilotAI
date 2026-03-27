// Common types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'viewer';
}

export interface StatCardData {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: string;
  prefix?: string;
  suffix?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
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

// Weather types
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
  rainfall?: number;
}

// GPS types
export interface Worker {
  id: string;
  name: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'inactive' | 'alert';
  zone: string;
  lastUpdate: Date;
  avatar?: string;
}

export interface GeoZone {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  }[];
  color: string;
  alertLevel?: 'none' | 'low' | 'medium' | 'high';
}

// Fraud detection types
export interface FraudCheck {
  claimId: string;
  gpsValid: boolean;
  weatherValid: boolean;
  behaviorValid: boolean;
  platformValid: boolean;
  riskScore: number;
  flags: string[];
  checkedAt: Date;
}

export interface FlaggedClaim {
  id: string;
  workerId: string;
  workerName: string;
  zone: string;
  amount: number;
  riskScore: number;
  flags: string[];
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  createdAt: Date;
}

// Payment types
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'success' | 'pending' | 'failed';
  workerId: string;
  workerName: string;
  purpose: string;
  createdAt: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export interface PaymentStats {
  totalProcessed: number;
  successRate: number;
  pending: number;
  failed: number;
}

// Claim types
export interface Claim {
  id: string;
  workerId: string;
  workerName: string;
  zone: string;
  triggerType: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'under_review' | 'auto_approved';
  riskScore: number;
  createdAt: Date;
  processedAt?: Date;
  payoutAmount?: number;
}

export interface ParametricTrigger {
  id: string;
  name: string;
  parameter: string;
  threshold: string;
  status: 'active' | 'inactive';
  lastTriggered?: Date;
}

// Analytics types
export interface ChartData {
  label: string;
  value: number;
  date?: Date;
}

export interface ZoneHeatmapData {
  zone: string;
  fraudCount: number;
  claimCount: number;
  lat: number;
  lng: number;
}
