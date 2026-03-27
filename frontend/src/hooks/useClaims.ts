import { useState, useCallback } from 'react';
import type { Claim } from '@/types/policy';
import { mockClaims } from '@/services/policyMockData';
import { useAuth } from '@/contexts/AuthContext';

interface UseClaimsReturn {
  claims: Claim[];
  userClaims: Claim[];
  pendingClaims: Claim[];
  loading: boolean;
  getClaimById: (id: string) => Claim | undefined;
  submitClaim: (claim: Partial<Claim>) => Promise<boolean>;
  approveClaim: (claimId: string, approvedAmount?: number) => Promise<boolean>;
  rejectClaim: (claimId: string, reason: string) => Promise<boolean>;
  markAsPaid: (claimId: string, paidAmount: number) => Promise<boolean>;
  refreshClaims: () => void;
}

export function useClaims(): UseClaimsReturn {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [loading, setLoading] = useState(false);

  // Get claims for current user
  const userClaims = claims.filter(c => c.userId === user?.id);

  // Get pending claims (for admin view)
  const pendingClaims = claims.filter(c => 
    c.status === 'pending' || c.status === 'under_review'
  );

  const getClaimById = useCallback((id: string) => {
    return claims.find(c => c.id === id);
  }, [claims]);

  const submitClaim = useCallback(async (claim: Partial<Claim>): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newClaim: Claim = {
      id: `CLM${Date.now()}`,
      policyId: claim.policyId || '',
      userId: user?.id || '',
      userName: user?.name || '',
      userEmail: user?.email || '',
      type: claim.type || 'General',
      description: claim.description || '',
      amount: claim.amount || 0,
      status: 'pending',
      createdAt: new Date(),
      submittedAt: new Date(),
      documents: claim.documents || [],
      incidentDate: claim.incidentDate || new Date(),
      incidentLocation: claim.incidentLocation,
    };
    
    setClaims(prev => [newClaim, ...prev]);
    setLoading(false);
    return true;
  }, [user]);

  const approveClaim = useCallback(async (claimId: string, approvedAmount?: number): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setClaims(prev =>
      prev.map(c =>
        c.id === claimId
          ? { 
              ...c, 
              status: 'approved' as const, 
              reviewedAt: new Date(), 
              reviewedBy: user?.id,
              approvedAt: new Date(),
              approvedBy: user?.id,
              paidAmount: approvedAmount || c.amount,
            }
          : c
      )
    );
    
    setLoading(false);
    return true;
  }, [user]);

  const rejectClaim = useCallback(async (claimId: string, reason: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setClaims(prev =>
      prev.map(c =>
        c.id === claimId
          ? { 
              ...c, 
              status: 'rejected' as const, 
              reviewedAt: new Date(), 
              reviewedBy: user?.id,
              rejectionReason: reason 
            }
          : c
      )
    );
    
    setLoading(false);
    return true;
  }, [user]);

  const markAsPaid = useCallback(async (claimId: string, paidAmount: number): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setClaims(prev =>
      prev.map(c =>
        c.id === claimId
          ? { 
              ...c, 
              status: 'paid' as const, 
              paidAt: new Date(),
              paidAmount 
            }
          : c
      )
    );
    
    setLoading(false);
    return true;
  }, []);

  const refreshClaims = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  }, []);

  return {
    claims,
    userClaims,
    pendingClaims,
    loading,
    getClaimById,
    submitClaim,
    approveClaim,
    rejectClaim,
    markAsPaid,
    refreshClaims,
  };
}
