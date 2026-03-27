import { useState, useEffect, useCallback } from 'react';
import { claimsApi, adminApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export interface ApiClaim {
  _id: string;
  policyId: any;
  userId: any;
  triggerType: string;
  triggerDescription?: string;
  eventTimestamp: string;
  location: { lat: number; lng: number; zone: string };
  payoutAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'paid';
  fraudScore: number;
  evidence: any[];
  createdAt: string;
  processedAt?: string;
  paidAt?: string;
  // computed
  id: string;
  amount: number;
  type: string;
  paidAmount?: number;
}

function normalizeClaim(c: any): ApiClaim {
  return {
    ...c,
    id: c._id,
    amount: c.payoutAmount,
    type: c.triggerType?.replace(/_/g, ' ')?.replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Claim',
    paidAmount: c.status === 'paid' ? c.payoutAmount : undefined,
  };
}

export function useClaimsApi() {
  const { user } = useAuth();
  const [userClaims, setUserClaims] = useState<ApiClaim[]>([]);
  const [adminClaims, setAdminClaims] = useState<ApiClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserClaims = useCallback(async () => {
    if (!user || user.role !== 'worker') return;
    setLoading(true);
    try {
      const res: any = await claimsApi.getMyClaims();
      setUserClaims((res.data || []).map(normalizeClaim));
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchAdminClaims = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const res: any = await adminApi.getClaims(status ? { status } : undefined);
      setAdminClaims(((res.data?.data) || []).map(normalizeClaim));
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitClaim = useCallback(async (data: {
    triggerType: string;
    eventTimestamp: string;
    location: { lat: number; lng: number; zone: string };
    description?: string;
  }) => {
    try {
      const res: any = await claimsApi.submitManual(data);
      toast.success(res.message || 'Claim submitted');
      fetchUserClaims();
      return true;
    } catch { return false; }
  }, [fetchUserClaims]);

  const approveClaim = useCallback(async (id: string) => {
    try {
      await adminApi.updateClaimStatus(id, 'approved');
      toast.success('Claim approved');
      fetchAdminClaims();
      return true;
    } catch { return false; }
  }, [fetchAdminClaims]);

  const rejectClaim = useCallback(async (id: string) => {
    try {
      await adminApi.updateClaimStatus(id, 'rejected');
      toast.success('Claim rejected');
      fetchAdminClaims();
      return true;
    } catch { return false; }
  }, [fetchAdminClaims]);

  const markAsPaid = useCallback(async (id: string) => {
    try {
      await adminApi.updateClaimStatus(id, 'paid');
      toast.success('Claim marked as paid');
      fetchAdminClaims();
      return true;
    } catch { return false; }
  }, [fetchAdminClaims]);

  useEffect(() => {
    if (user?.role === 'worker') fetchUserClaims();
    else if (user?.role === 'admin' || user?.role === 'insurer') fetchAdminClaims();
  }, [user]);

  const pendingClaims = adminClaims.filter(c => c.status === 'pending');

  return {
    userClaims,
    adminClaims,
    pendingClaims,
    loading,
    error,
    fetchUserClaims,
    fetchAdminClaims,
    submitClaim,
    approveClaim,
    rejectClaim,
    markAsPaid,
  };
}
