import { useState, useEffect, useCallback } from 'react';
import { policyApi, adminApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export interface ApiPolicy {
  _id: string;
  userId: string | { _id: string; name: string; email: string; mobile: string; platform: string; zone: string };
  tier: 'basic' | 'standard' | 'premium';
  weeklyPremium: number;
  maxCoverage: number;
  eventsPerWeek: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'rejected';
  autoRenewal: boolean;
  coverageUsed: number;
  coverageRemaining: number;
  createdAt: string;
  // computed for UI
  id: string;
  premium: number;
  coverage: number;
  type: string;
  endDateFormatted: string;
}

function normalizePolicy(p: any): ApiPolicy {
  return {
    ...p,
    id: p._id,
    premium: p.weeklyPremium,
    coverage: p.maxCoverage,
    type: p.tier,
    endDateFormatted: new Date(p.endDate).toLocaleDateString('en-IN'),
  };
}

export function usePoliciesApi() {
  const { user } = useAuth();
  const [userPolicies, setUserPolicies] = useState<ApiPolicy[]>([]);
  const [adminPolicies, setAdminPolicies] = useState<ApiPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPolicies = useCallback(async () => {
    if (!user || user.role !== 'worker') return;
    setLoading(true);
    try {
      const res: any = await policyApi.getMyPolicies();
      setUserPolicies((res.data || []).map(normalizePolicy));
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchAdminPolicies = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const res: any = await adminApi.getPolicies(status ? { status } : undefined);
      setAdminPolicies(((res.data?.data) || []).map(normalizePolicy));
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  }, []);

  const approvePolicy = useCallback(async (id: string) => {
    try {
      await adminApi.updatePolicyStatus(id, 'active');
      toast.success('Policy approved');
      fetchAdminPolicies();
      return true;
    } catch { return false; }
  }, [fetchAdminPolicies]);

  const rejectPolicy = useCallback(async (id: string) => {
    try {
      await adminApi.updatePolicyStatus(id, 'rejected');
      toast.success('Policy rejected');
      fetchAdminPolicies();
      return true;
    } catch { return false; }
  }, [fetchAdminPolicies]);

  const createPolicy = useCallback(async (data: { tier: string; paymentMethod: string; autoRenewal: boolean }) => {
    try {
      const res: any = await policyApi.create(data);
      toast.success(res.message || 'Policy submitted for approval');
      fetchUserPolicies();
      return true;
    } catch { return false; }
  }, [fetchUserPolicies]);

  const cancelPolicy = useCallback(async (id: string) => {
    try {
      await policyApi.cancel(id);
      toast.success('Policy cancelled');
      fetchUserPolicies();
      return true;
    } catch { return false; }
  }, [fetchUserPolicies]);

  useEffect(() => {
    if (user?.role === 'worker') fetchUserPolicies();
    else if (user?.role === 'admin' || user?.role === 'insurer') fetchAdminPolicies();
  }, [user]);

  const pendingApplications = adminPolicies.filter(p => p.status === 'pending');

  return {
    userPolicies,
    adminPolicies,
    pendingApplications,
    loading,
    error,
    fetchUserPolicies,
    fetchAdminPolicies,
    approvePolicy,
    rejectPolicy,
    createPolicy,
    cancelPolicy,
  };
}
