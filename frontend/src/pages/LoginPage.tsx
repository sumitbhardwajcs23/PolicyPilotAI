import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Shield,
  User,
  Users,
  Crown,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Building2,
  Car,
  Heart,
  Umbrella,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleOption {
  id: UserRole;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const roles: RoleOption[] = [
  {
    id: 'worker',
    name: 'Policy Holder',
    description: 'View policies, submit claims, manage account',
    icon: User,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  {
    id: 'insurer',
    name: 'Insurer',
    description: 'Manage policies and claims within scope',
    icon: Users,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full system access and control',
    icon: Crown,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('worker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo credentials check (in production, this would be a real auth call)
    if (email && password.length >= 4) {
      // Create a mock user matching the shared User type
      const mockUser = {
        id: `demo-${Date.now()}`,
        mobile: '+919876543210',
        name: selectedRole === 'worker' ? 'Rahul Sharma' : selectedRole === 'admin' ? 'Admin User' : 'Insurer User',
        email,
        role: selectedRole,
        platform: 'both' as const,
        zone: 'Andheri West',
        upiId: 'demo@upi',
        kycStatus: 'verified' as const,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      login('demo-token-' + Date.now(), mockUser);
      
      // Redirect based on role
      if (selectedRole === 'worker') {
        navigate('/dashboard');
      } else {
        navigate('/admin');
      }
    } else {
      setError('Invalid credentials. Please try again.');
    }

    setIsLoading(false);
  };

  const getDemoCredentials = (): { email: string; password: string } => {
    switch (selectedRole) {
      case 'worker':
        return { email: 'rahul@example.com', password: 'user123' };
      case 'insurer':
        return { email: 'insurer@policypilotai.in', password: 'admin123' };
      case 'admin':
        return { email: 'admin@policypilotai.in', password: 'master123' };
      default:
        return { email: 'rahul@example.com', password: 'user123' };
    }
  };

  const applyDemoCredentials = () => {
    const creds = getDemoCredentials();
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Branding & Info */}
        <div className="hidden lg:flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">PolicyPilotAI</h1>
                <p className="text-white/60">Secure Your Future</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Smart Insurance
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Management Platform
              </span>
            </h2>
            <p className="text-white/60 text-lg mb-8">
              Experience the next generation of insurance management with AI-powered fraud detection, 
              real-time tracking, and seamless claim processing.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Car, label: 'Auto Insurance', desc: 'Vehicle protection' },
              { icon: Heart, label: 'Health Coverage', desc: 'Medical insurance' },
              { icon: Building2, label: 'Property', desc: 'Home & business' },
              { icon: Umbrella, label: 'Life Insurance', desc: 'Family security' },
            ].map((feature) => (
              <div
                key={feature.label}
                className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all"
              >
                <feature.icon className="w-6 h-6 text-cyan-400 mb-2" />
                <div className="text-white font-medium">{feature.label}</div>
                <div className="text-sm text-white/50">{feature.desc}</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-8 pt-8 border-t border-white/10">
            {[
              { value: '50K+', label: 'Active Policies' },
              { value: '98%', label: 'Claim Success' },
              { value: '24/7', label: 'Support' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <GlassCard className="p-8" glow="primary">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">PolicyPilotAI</h1>
              <p className="text-sm text-white/60">Secure Your Future</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-white/60">Select your role and sign in to continue</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id);
                  setError(null);
                }}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-center',
                  selectedRole === role.id
                    ? `border-cyan-500 bg-cyan-500/10`
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2',
                    role.bgColor
                  )}
                >
                  <role.icon className={cn('w-5 h-5', role.color)} />
                </div>
                <div className="text-white text-sm font-medium">{role.name}</div>
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-400 text-xs">!</span>
                </div>
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* Demo Credentials Hint */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">Demo Credentials</span>
                <button
                  type="button"
                  onClick={applyDemoCredentials}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Auto-fill
                </button>
              </div>
              <code className="text-xs text-white/40 font-mono block">
                {getDemoCredentials().email} / {getDemoCredentials().password}
              </code>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-6"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-white/40 text-sm">
              Don't have an account?{' '}
              <button className="text-cyan-400 hover:text-cyan-300 font-medium">
                Contact Support
              </button>
            </p>
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-xs">
            <Lock className="w-3 h-3" />
            <span>Secured with 256-bit encryption</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
