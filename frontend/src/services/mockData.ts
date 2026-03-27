import type { 
  Worker, 
  WeatherData, 
  ForecastDay, 
  FlaggedClaim, 
  Transaction, 
  Claim, 
  ParametricTrigger,
  ChartData,
  ZoneHeatmapData,
  GeoZone
} from '@/types';

// Mock Weather Data
export const mockWeatherData: WeatherData = {
  location: 'Mumbai, India',
  temperature: 32,
  condition: 'Heavy Rain',
  humidity: 85,
  windSpeed: 24,
  rainfall: 58,
  icon: 'rain',
  alerts: [
    {
      id: '1',
      event: 'Heavy Rainfall Warning',
      description: 'Rainfall exceeding 50mm/hr detected in Andheri West',
      severity: 'high',
      start: new Date(),
      end: new Date(Date.now() + 3600000),
    },
    {
      id: '2',
      event: 'Flooding Alert',
      description: 'Water level rising in Bandra area',
      severity: 'critical',
      start: new Date(),
      end: new Date(Date.now() + 7200000),
    },
  ],
};

export const mockForecast: ForecastDay[] = [
  { date: new Date(), tempMin: 26, tempMax: 32, condition: 'Heavy Rain', icon: 'rain', rainfall: 58 },
  { date: new Date(Date.now() + 86400000), tempMin: 25, tempMax: 30, condition: 'Thunderstorm', icon: 'cloud-lightning', rainfall: 42 },
  { date: new Date(Date.now() + 172800000), tempMin: 24, tempMax: 29, condition: 'Rain', icon: 'cloud-rain', rainfall: 25 },
  { date: new Date(Date.now() + 259200000), tempMin: 25, tempMax: 31, condition: 'Cloudy', icon: 'cloud', rainfall: 5 },
  { date: new Date(Date.now() + 345600000), tempMin: 26, tempMax: 33, condition: 'Partly Cloudy', icon: 'cloud-sun', rainfall: 0 },
];

// Mock Workers Data
export const mockWorkers: Worker[] = [
  { id: 'W001', name: 'Rahul Sharma', phone: '+91 98765 43210', location: { lat: 19.0760, lng: 72.8777 }, status: 'active', zone: 'Andheri West', lastUpdate: new Date() },
  { id: 'W002', name: 'Priya Patel', phone: '+91 98765 43211', location: { lat: 19.0596, lng: 72.8295 }, status: 'active', zone: 'Bandra', lastUpdate: new Date() },
  { id: 'W003', name: 'Amit Kumar', phone: '+91 98765 43212', location: { lat: 19.1136, lng: 72.8697 }, status: 'alert', zone: 'Andheri West', lastUpdate: new Date(Date.now() - 300000) },
  { id: 'W004', name: 'Sneha Gupta', phone: '+91 98765 43213', location: { lat: 19.0365, lng: 72.8170 }, status: 'active', zone: 'Bandra', lastUpdate: new Date() },
  { id: 'W005', name: 'Vikram Singh', phone: '+91 98765 43214', location: { lat: 19.0822, lng: 72.8816 }, status: 'inactive', zone: 'Andheri East', lastUpdate: new Date(Date.now() - 3600000) },
  { id: 'W006', name: 'Neha Reddy', phone: '+91 98765 43215', location: { lat: 19.0456, lng: 72.8400 }, status: 'active', zone: 'Khar', lastUpdate: new Date() },
  { id: 'W007', name: 'Arjun Mehta', phone: '+91 98765 43216', location: { lat: 19.0890, lng: 72.8910 }, status: 'alert', zone: 'Andheri West', lastUpdate: new Date(Date.now() - 600000) },
  { id: 'W008', name: 'Divya Nair', phone: '+91 98765 43217', location: { lat: 19.0200, lng: 72.8200 }, status: 'active', zone: 'Bandra West', lastUpdate: new Date() },
];

// Mock Geo Zones
export const mockGeoZones: GeoZone[] = [
  {
    id: 'Z001',
    name: 'Andheri West',
    coordinates: [
      { lat: 19.0900, lng: 72.8600 },
      { lat: 19.0900, lng: 72.8900 },
      { lat: 19.0700, lng: 72.8900 },
      { lat: 19.0700, lng: 72.8600 },
    ],
    color: '#ef4444',
    alertLevel: 'high',
  },
  {
    id: 'Z002',
    name: 'Bandra',
    coordinates: [
      { lat: 19.0600, lng: 72.8100 },
      { lat: 19.0600, lng: 72.8400 },
      { lat: 19.0300, lng: 72.8400 },
      { lat: 19.0300, lng: 72.8100 },
    ],
    color: '#f59e0b',
    alertLevel: 'medium',
  },
  {
    id: 'Z003',
    name: 'Andheri East',
    coordinates: [
      { lat: 19.0900, lng: 72.8900 },
      { lat: 19.0900, lng: 72.9200 },
      { lat: 19.0700, lng: 72.9200 },
      { lat: 19.0700, lng: 72.8900 },
    ],
    color: '#10b981',
    alertLevel: 'none',
  },
];

// Mock Flagged Claims
export const mockFlaggedClaims: FlaggedClaim[] = [
  {
    id: 'CLM001',
    workerId: 'W003',
    workerName: 'Amit Kumar',
    zone: 'Andheri West',
    amount: 2500,
    riskScore: 78,
    flags: ['GPS mismatch', 'Duplicate claim'],
    status: 'under_review',
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'CLM002',
    workerId: 'W007',
    workerName: 'Arjun Mehta',
    zone: 'Andheri West',
    amount: 1800,
    riskScore: 85,
    flags: ['Weather mismatch', 'Platform not verified'],
    status: 'pending',
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: 'CLM003',
    workerId: 'W005',
    workerName: 'Vikram Singh',
    zone: 'Andheri East',
    amount: 3200,
    riskScore: 45,
    flags: ['Behavioral anomaly'],
    status: 'under_review',
    createdAt: new Date(Date.now() - 259200000),
  },
  {
    id: 'CLM004',
    workerId: 'W001',
    workerName: 'Rahul Sharma',
    zone: 'Andheri West',
    amount: 1500,
    riskScore: 25,
    flags: [],
    status: 'approved',
    createdAt: new Date(Date.now() - 345600000),
  },
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    amount: 2500,
    currency: 'INR',
    status: 'success',
    workerId: 'W001',
    workerName: 'Rahul Sharma',
    purpose: 'Claim Payout - Heavy Rain',
    createdAt: new Date(Date.now() - 3600000),
    razorpayOrderId: 'order_123',
    razorpayPaymentId: 'pay_123',
  },
  {
    id: 'TXN002',
    amount: 1800,
    currency: 'INR',
    status: 'pending',
    workerId: 'W002',
    workerName: 'Priya Patel',
    purpose: 'Claim Payout - Flooding',
    createdAt: new Date(Date.now() - 7200000),
    razorpayOrderId: 'order_124',
  },
  {
    id: 'TXN003',
    amount: 3200,
    currency: 'INR',
    status: 'success',
    workerId: 'W004',
    workerName: 'Sneha Gupta',
    purpose: 'Claim Payout - Extreme Heat',
    createdAt: new Date(Date.now() - 86400000),
    razorpayOrderId: 'order_125',
    razorpayPaymentId: 'pay_125',
  },
  {
    id: 'TXN004',
    amount: 1500,
    currency: 'INR',
    status: 'failed',
    workerId: 'W005',
    workerName: 'Vikram Singh',
    purpose: 'Claim Payout - Pollution',
    createdAt: new Date(Date.now() - 172800000),
    razorpayOrderId: 'order_126',
  },
  {
    id: 'TXN005',
    amount: 2100,
    currency: 'INR',
    status: 'success',
    workerId: 'W006',
    workerName: 'Neha Reddy',
    purpose: 'Claim Payout - Heavy Rain',
    createdAt: new Date(Date.now() - 259200000),
    razorpayOrderId: 'order_127',
    razorpayPaymentId: 'pay_127',
  },
];

// Mock Claims
export const mockClaims: Claim[] = [
  {
    id: 'CLM001',
    workerId: 'W001',
    workerName: 'Rahul Sharma',
    zone: 'Andheri West',
    triggerType: 'Heavy Rainfall',
    amount: 2500,
    status: 'auto_approved',
    riskScore: 15,
    createdAt: new Date(Date.now() - 3600000),
    processedAt: new Date(Date.now() - 3000000),
    payoutAmount: 2500,
  },
  {
    id: 'CLM002',
    workerId: 'W002',
    workerName: 'Priya Patel',
    zone: 'Bandra',
    triggerType: 'Flooding',
    amount: 1800,
    status: 'under_review',
    riskScore: 65,
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: 'CLM003',
    workerId: 'W003',
    workerName: 'Amit Kumar',
    zone: 'Andheri West',
    triggerType: 'Heavy Rainfall',
    amount: 3200,
    status: 'pending',
    riskScore: 78,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'CLM004',
    workerId: 'W004',
    workerName: 'Sneha Gupta',
    zone: 'Bandra',
    triggerType: 'Extreme Heat',
    amount: 1500,
    status: 'auto_approved',
    riskScore: 22,
    createdAt: new Date(Date.now() - 172800000),
    processedAt: new Date(Date.now() - 169200000),
    payoutAmount: 1500,
  },
  {
    id: 'CLM005',
    workerId: 'W005',
    workerName: 'Vikram Singh',
    zone: 'Andheri East',
    triggerType: 'Severe Pollution',
    amount: 2100,
    status: 'rejected',
    riskScore: 88,
    createdAt: new Date(Date.now() - 259200000),
    processedAt: new Date(Date.now() - 255600000),
  },
];

// Mock Parametric Triggers
export const mockTriggers: ParametricTrigger[] = [
  {
    id: 'TRG001',
    name: 'Heavy Rainfall',
    parameter: 'Precipitation rate',
    threshold: '> 50 mm/hr for 2+ hrs',
    status: 'active',
    lastTriggered: new Date(),
  },
  {
    id: 'TRG002',
    name: 'Extreme Heat',
    parameter: 'Temperature + humidity',
    threshold: 'Heat index > 45°C',
    status: 'active',
  },
  {
    id: 'TRG003',
    name: 'Severe Pollution',
    parameter: 'AQI',
    threshold: '> 400 (Severe category)',
    status: 'active',
  },
  {
    id: 'TRG004',
    name: 'Flooding',
    parameter: 'Water level',
    threshold: 'Zone flood alert issued',
    status: 'active',
    lastTriggered: new Date(Date.now() - 3600000),
  },
  {
    id: 'TRG005',
    name: 'Social Disruption',
    parameter: 'Platform/govt alert',
    threshold: 'Zone closure notification',
    status: 'inactive',
  },
];

// Mock Chart Data
export const mockClaimsChartData: ChartData[] = [
  { label: 'Mon', value: 12, date: new Date() },
  { label: 'Tue', value: 19, date: new Date(Date.now() + 86400000) },
  { label: 'Wed', value: 15, date: new Date(Date.now() + 172800000) },
  { label: 'Thu', value: 25, date: new Date(Date.now() + 259200000) },
  { label: 'Fri', value: 32, date: new Date(Date.now() + 345600000) },
  { label: 'Sat', value: 28, date: new Date(Date.now() + 432000000) },
  { label: 'Sun', value: 20, date: new Date(Date.now() + 518400000) },
];

export const mockPolicyDistribution: ChartData[] = [
  { label: 'Auto-Approved', value: 68 },
  { label: 'Manual Review', value: 27 },
  { label: 'Auto-Rejected', value: 5 },
];

export const mockFraudByZone: ZoneHeatmapData[] = [
  { zone: 'Andheri West', fraudCount: 15, claimCount: 120, lat: 19.0760, lng: 72.8777 },
  { zone: 'Bandra', fraudCount: 8, claimCount: 95, lat: 19.0596, lng: 72.8295 },
  { zone: 'Andheri East', fraudCount: 5, claimCount: 78, lat: 19.1136, lng: 72.8697 },
  { zone: 'Khar', fraudCount: 3, claimCount: 45, lat: 19.0667, lng: 72.8400 },
  { zone: 'Juhu', fraudCount: 2, claimCount: 38, lat: 19.1075, lng: 72.8263 },
];

export const mockPayoutDistribution: ChartData[] = [
  { label: '0-500', value: 15 },
  { label: '500-1000', value: 32 },
  { label: '1000-2000', value: 45 },
  { label: '2000-3000', value: 28 },
  { label: '3000+', value: 12 },
];
