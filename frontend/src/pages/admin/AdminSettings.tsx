import { useState } from 'react';

import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield,
  Settings,
  Bell,
  Mail,
  Lock,
  Database,
  Globe,
  CreditCard,
  CheckCircle,
  Save,
  RefreshCw,
  Key,
  Webhook,
} from 'lucide-react';

interface SystemSetting {
  id: string;
  name: string;
  description: string;
  value: boolean | string | number;
  type: 'toggle' | 'text' | 'number' | 'select';
  options?: string[];
  category: 'general' | 'security' | 'notifications' | 'integrations';
}

const mockSettings: SystemSetting[] = [
  // General Settings
  {
    id: 'auto_approve_threshold',
    name: 'Auto-Approve Threshold',
    description: 'Maximum claim amount for auto-approval (₹)',
    value: 50000,
    type: 'number',
    category: 'general',
  },
  {
    id: 'session_timeout',
    name: 'Session Timeout',
    description: 'User session timeout in minutes',
    value: 30,
    type: 'number',
    category: 'general',
  },
  {
    id: 'maintenance_mode',
    name: 'Maintenance Mode',
    description: 'Enable maintenance mode for system updates',
    value: false,
    type: 'toggle',
    category: 'general',
  },
  {
    id: 'default_currency',
    name: 'Default Currency',
    description: 'Primary currency for all transactions',
    value: 'INR',
    type: 'select',
    options: ['INR', 'USD', 'EUR', 'GBP'],
    category: 'general',
  },
  // Security Settings
  {
    id: 'two_factor_auth',
    name: 'Two-Factor Authentication',
    description: 'Require 2FA for all admin accounts',
    value: true,
    type: 'toggle',
    category: 'security',
  },
  {
    id: 'password_expiry',
    name: 'Password Expiry',
    description: 'Days before password expiration',
    value: 90,
    type: 'number',
    category: 'security',
  },
  {
    id: 'login_attempts',
    name: 'Max Login Attempts',
    description: 'Failed attempts before account lockout',
    value: 5,
    type: 'number',
    category: 'security',
  },
  {
    id: 'ip_whitelist',
    name: 'IP Whitelisting',
    description: 'Restrict admin access to specific IPs',
    value: false,
    type: 'toggle',
    category: 'security',
  },
  // Notification Settings
  {
    id: 'email_notifications',
    name: 'Email Notifications',
    description: 'Send email alerts for important events',
    value: true,
    type: 'toggle',
    category: 'notifications',
  },
  {
    id: 'sms_notifications',
    name: 'SMS Notifications',
    description: 'Send SMS alerts for critical events',
    value: true,
    type: 'toggle',
    category: 'notifications',
  },
  {
    id: 'claim_status_updates',
    name: 'Claim Status Updates',
    description: 'Notify users on claim status changes',
    value: true,
    type: 'toggle',
    category: 'notifications',
  },
  {
    id: 'policy_expiry_alerts',
    name: 'Policy Expiry Alerts',
    description: 'Send alerts before policy expiration',
    value: true,
    type: 'toggle',
    category: 'notifications',
  },
  // Integration Settings
  {
    id: 'razorpay_enabled',
    name: 'Razorpay Payments',
    description: 'Enable Razorpay payment gateway',
    value: true,
    type: 'toggle',
    category: 'integrations',
  },
  {
    id: 'weather_api_enabled',
    name: 'Weather API',
    description: 'Enable weather data integration',
    value: true,
    type: 'toggle',
    category: 'integrations',
  },
  {
    id: 'gps_tracking_enabled',
    name: 'GPS Tracking',
    description: 'Enable GPS tracking for claims',
    value: true,
    type: 'toggle',
    category: 'integrations',
  },
  {
    id: 'fraud_detection_enabled',
    name: 'Fraud Detection',
    description: 'Enable AI-powered fraud detection',
    value: true,
    type: 'toggle',
    category: 'integrations',
  },
];

export function AdminSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>(mockSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);



  const handleSettingChange = (id: string, value: boolean | string | number) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, value } : setting
      )
    );
  };

  const handleSave = () => {
    setSavedMessage('Settings saved successfully!');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleReset = () => {
    setSettings(mockSettings);
    setSavedMessage('Settings reset to defaults!');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const getSettingsByCategory = (category: string) =>
    settings.filter(s => s.category === category);

  const renderSetting = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <div key={setting.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
            <div className="flex-1 pr-4">
              <h4 className="text-white font-medium">{setting.name}</h4>
              <p className="text-sm text-white/50">{setting.description}</p>
            </div>
            <Switch
              checked={setting.value as boolean}
              onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
            />
          </div>
        );
      case 'number':
        return (
          <div key={setting.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
            <div className="flex-1 pr-4">
              <h4 className="text-white font-medium">{setting.name}</h4>
              <p className="text-sm text-white/50">{setting.description}</p>
            </div>
            <Input
              type="number"
              value={setting.value as number}
              onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
              className="w-32 bg-white/5 border-white/10 text-white"
            />
          </div>
        );
      case 'select':
        return (
          <div key={setting.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
            <div className="flex-1 pr-4">
              <h4 className="text-white font-medium">{setting.name}</h4>
              <p className="text-sm text-white/50">{setting.description}</p>
            </div>
            <Select
              value={setting.value as string}
              onValueChange={(value) => handleSettingChange(setting.id, value)}
            >
              <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {setting.options?.map(option => (
                  <SelectItem key={option} value={option} className="text-white">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
          <p className="text-white/60 mt-1">Configure global system preferences and integrations</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-white/10 text-white hover:bg-white/5"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <GlassCard glow="success" padding="sm" className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400">{savedMessage}</span>
        </GlassCard>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="general" className="data-[state=active]:bg-cyan-500/20">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-cyan-500/20">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-cyan-500/20">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-cyan-500/20">
            <Webhook className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GlassCard>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <Settings className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">General Settings</h3>
            </div>
            <div className="space-y-2">
              {getSettingsByCategory('general').map(renderSetting)}
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <GlassCard>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <Lock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Security Settings</h3>
            </div>
            <div className="space-y-2">
              {getSettingsByCategory('security').map(renderSetting)}
            </div>
          </GlassCard>

          {/* API Keys Section */}
          <GlassCard className="mt-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">API Keys</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKeys(!showApiKeys)}
                className="border-white/10 text-white hover:bg-white/5"
              >
                {showApiKeys ? 'Hide' : 'Show'} Keys
              </Button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Razorpay Key ID', value: 'rzp_test_************', mask: true },
                { name: 'Razorpay Secret', value: '****************', mask: true },
                { name: 'Weather API Key', value: 'wx_****************', mask: true },
                { name: 'GPS API Key', value: 'gps_****************', mask: true },
              ].map((key) => (
                <div key={key.name} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <h4 className="text-white font-medium">{key.name}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="px-3 py-1 bg-white/5 rounded text-sm text-white/60 font-mono">
                      {showApiKeys ? key.value.replace(/\*/g, 'X') : key.value}
                    </code>
                    <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                      Regenerate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <GlassCard>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <Bell className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
            </div>
            <div className="space-y-2">
              {getSettingsByCategory('notifications').map(renderSetting)}
            </div>
          </GlassCard>

          {/* Email Templates */}
          <GlassCard className="mt-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <Mail className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Email Templates</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Welcome Email', description: 'Sent to new users on registration' },
                { name: 'Policy Approved', description: 'Sent when policy is approved' },
                { name: 'Claim Submitted', description: 'Sent when claim is submitted' },
                { name: 'Claim Approved', description: 'Sent when claim is approved' },
                { name: 'Payment Received', description: 'Sent on successful payment' },
                { name: 'Policy Expiry', description: 'Sent before policy expiration' },
              ].map((template) => (
                <div
                  key={template.name}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-500/30 transition-colors cursor-pointer"
                >
                  <h4 className="text-white font-medium">{template.name}</h4>
                  <p className="text-sm text-white/50">{template.description}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <GlassCard>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <Webhook className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Integration Settings</h3>
            </div>
            <div className="space-y-2">
              {getSettingsByCategory('integrations').map(renderSetting)}
            </div>
          </GlassCard>

          {/* Integration Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {[
              { name: 'Razorpay', status: 'connected', icon: CreditCard },
              { name: 'Weather API', status: 'connected', icon: Globe },
              { name: 'GPS Service', status: 'connected', icon: Database },
              { name: 'Fraud Detection', status: 'connected', icon: Shield },
            ].map((integration) => (
              <GlassCard key={integration.name} className="text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                  <integration.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h4 className="text-white font-medium">{integration.name}</h4>
                <StatusBadge status="success" className="mt-2">Connected</StatusBadge>
              </GlassCard>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* System Status */}
      <GlassCard className="mt-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <Database className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">System Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">99.9%</div>
            <div className="text-sm text-white/60">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">245ms</div>
            <div className="text-sm text-white/60">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">1.2M</div>
            <div className="text-sm text-white/60">API Calls/Day</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">12</div>
            <div className="text-sm text-white/60">Active Sessions</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
