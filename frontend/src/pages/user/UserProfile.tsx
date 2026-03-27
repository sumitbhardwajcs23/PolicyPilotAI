import { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { usePolicies } from '@/hooks/usePolicies';
import { useClaims } from '@/hooks/useClaims';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Shield,
  FileText,
  Edit2,
  Save,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function UserProfile() {
  const { user } = useAuth();
  const { userPolicies } = usePolicies();
  const { userClaims } = useClaims();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+91 98765 43210',
    address: '123, Main Street, Mumbai, Maharashtra',
  });

  const activePolicies = userPolicies.filter(p => p.status === 'active');
  const totalCoverage = activePolicies.reduce((sum, p) => sum + p.coverage, 0);
  const totalClaimed = userClaims
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + (c.paidAmount || 0), 0);

  const handleSave = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-sm text-white/60">Manage your account information</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            isEditing
              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
              : 'bg-white/5 text-white hover:bg-white/10'
          )}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </>
          )}
        </button>
      </div>

      {/* Profile Header Card */}
      <GlassCard>
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user?.name?.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full max-w-md px-4 py-2 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full max-w-md px-4 py-2 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                <p className="text-white/60">{user?.email}</p>
                <div className="flex items-center gap-3 mt-3">
                  <StatusBadge status="success">Active Member</StatusBadge>
                  <span className="text-sm text-white/40">Since 2024</span>
                </div>
              </>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{activePolicies.length}</p>
              <p className="text-xs text-white/60">Active Policies</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">₹{(totalCoverage / 100000).toFixed(1)}L</p>
              <p className="text-xs text-white/60">Total Coverage</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{userClaims.length}</p>
              <p className="text-xs text-white/60">Total Claims</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">₹{(totalClaimed / 1000).toFixed(1)}K</p>
              <p className="text-xs text-white/60">Total Claimed</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="text-sm text-white/60">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
                  />
                ) : (
                  <p className="text-sm text-white">{user?.email}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Phone className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="text-sm text-white/60">Phone</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50"
                  />
                ) : (
                  <p className="text-sm text-white">{formData.phone}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="text-sm text-white/60">Address</p>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-lg text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                ) : (
                  <p className="text-sm text-white">{formData.address}</p>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <User className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="text-sm text-white/60">User ID</p>
                <p className="text-sm font-mono text-white">{user?.id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="text-sm text-white/60">Member Since</p>
                <p className="text-sm text-white">January 2024</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="text-sm text-white/60">Account Status</p>
                <StatusBadge status="success">Active</StatusBadge>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Security Settings */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-sm font-medium text-white">Change Password</p>
              <p className="text-xs text-white/60">Update your account password</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors">
              Change
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
              <p className="text-xs text-white/60">Add an extra layer of security</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="success">Enabled</StatusBadge>
              <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors">
                Manage
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-sm font-medium text-white">Login History</p>
              <p className="text-xs text-white/60">View recent login activity</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors">
              View
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
