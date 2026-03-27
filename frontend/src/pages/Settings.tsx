import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  Cloud,
  MapPin,
  Save,
  CheckCircle2,
  Key,
  Webhook
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-white/60">Manage your account and system preferences</p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            saved
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
          )}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <GlassCard className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                      activeTab === tab.id
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </GlassCard>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-6">Profile Settings</h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">AD</span>
                  </div>
                  <div>
                    <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white transition-colors">
                      Change Avatar
                    </button>
                    <p className="text-xs text-white/40 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Admin User"
                      className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="admin@Policy Pilot AI.com"
                      className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Role</label>
                    <select className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50">
                      <option className="bg-gray-900">Administrator</option>
                      <option className="bg-gray-900">Manager</option>
                      <option className="bg-gray-900">Viewer</option>
                    </select>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
              
              <div className="space-y-4">
                {[
                  { id: 'fraud', label: 'Fraud Alerts', description: 'Get notified when high-risk claims are detected' },
                  { id: 'payments', label: 'Payment Updates', description: 'Receive notifications for successful/failed payments' },
                  { id: 'weather', label: 'Weather Alerts', description: 'Get alerts for severe weather conditions' },
                  { id: 'system', label: 'System Updates', description: 'Receive maintenance and update notifications' },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-white/60">{item.description}</p>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-emerald-500/30 relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <GlassCard>
                <h3 className="text-lg font-semibold text-white mb-6">Change Password</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="text-lg font-semibold text-white mb-6">Two-Factor Authentication</h3>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">2FA Enabled</p>
                      <p className="text-xs text-white/60">Your account is secured with authenticator app</p>
                    </div>
                  </div>
                  <StatusBadge status="success">Active</StatusBadge>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Integrations Settings */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Razorpay Integration</h3>
                    <p className="text-sm text-white/60">Payment gateway configuration</p>
                  </div>
                  <StatusBadge status="success">Connected</StatusBadge>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">API Key ID</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        defaultValue="rzp_test_xxxxxxxxxxxx"
                        className="flex-1 px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
                      />
                      <button className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
                        <Key className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Webhook URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        defaultValue="https://api.Policy Pilot AI.com/webhooks/razorpay"
                        className="flex-1 px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
                      />
                      <button className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
                        <Webhook className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Weather API</h3>
                    <p className="text-sm text-white/60">OpenWeatherMap configuration</p>
                  </div>
                  <StatusBadge status="success">Connected</StatusBadge>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">API Key</label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        defaultValue="owm_xxxxxxxxxxxx"
                        className="flex-1 px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
                      />
                      <button className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
                        <Cloud className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Polling Interval</label>
                    <select className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50">
                      <option className="bg-gray-900">5 minutes</option>
                      <option className="bg-gray-900">10 minutes</option>
                      <option className="bg-gray-900">15 minutes</option>
                      <option className="bg-gray-900">30 minutes</option>
                    </select>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">GPS Tracking</h3>
                    <p className="text-sm text-white/60">Geolocation service settings</p>
                  </div>
                  <StatusBadge status="success">Active</StatusBadge>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Update Interval</label>
                    <select className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50">
                      <option className="bg-gray-900">30 seconds</option>
                      <option className="bg-gray-900">1 minute</option>
                      <option className="bg-gray-900">5 minutes</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm font-medium text-white">High Accuracy Mode</p>
                        <p className="text-xs text-white/60">Use GPS for precise location</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-emerald-500/30 relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
