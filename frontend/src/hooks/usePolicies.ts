import { useState, useCallback } from 'react';
import type { Policy, PolicyApplication } from '@/types/policy';
import { mockPolicies, mockPolicyApplications } from '@/services/policyMockData';
import { useAuth } from '@/contexts/AuthContext';

interface UsePoliciesReturn {
  policies: Policy[];
  applications: PolicyApplication[];
  userPolicies: Policy[];
  pendingApplications: PolicyApplication[];
  loading: boolean;
  getPolicyById: (id: string) => Policy | undefined;
  getApplicationById: (id: string) => PolicyApplication | undefined;
  submitPolicyApplication: (application: Partial<PolicyApplication>) => Promise<boolean>;
  approvePolicy: (policyId: string, notes?: string) => Promise<boolean>;
  rejectPolicy: (policyId: string, reason: string) => Promise<boolean>;
  updatePolicy: (policyId: string, updates: Partial<Policy>) => Promise<boolean>;
  refreshPolicies: () => void;
}

export function usePolicies(): UsePoliciesReturn {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>(mockPolicies);
  const [applications, setApplications] = useState<PolicyApplication[]>(mockPolicyApplications);
  const [loading, setLoading] = useState(false);

  // Get policies for current user
  const userPolicies = policies.filter(p => p.userId === user?.id);

  // Get pending applications (for admin view)
  const pendingApplications = applications.filter(a => 
    a.status === 'submitted' || a.status === 'under_review'
  );

  const getPolicyById = useCallback((id: string) => {
    return policies.find(p => p.id === id);
  }, [policies]);

  const getApplicationById = useCallback((id: string) => {
    return applications.find(a => a.id === id);
  }, [applications]);

  const submitPolicyApplication = useCallback(async (application: Partial<PolicyApplication>): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newApplication: PolicyApplication = {
      id: `APP${Date.now()}`,
      userId: user?.id || '',
      userName: user?.name || '',
      userEmail: user?.email || '',
      type: application.type || 'health',
      status: 'submitted',
      premium: application.premium || 0,
      coverage: application.coverage || 0,
      duration: application.duration || 12,
      createdAt: new Date(),
      submittedAt: new Date(),
    };
    
    setApplications(prev => [newApplication, ...prev]);
    setLoading(false);
    return true;
  }, [user]);

  const approvePolicy = useCallback(async (applicationId: string, _notes?: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const application = applications.find(a => a.id === applicationId);
    if (!application) {
      setLoading(false);
      return false;
    }

    // Update application status
    setApplications(prev =>
      prev.map(a =>
        a.id === applicationId
          ? { ...a, status: 'approved' as const, reviewedAt: new Date(), reviewedBy: user?.id }
          : a
      )
    );

    // Create new policy
    const newPolicy: Policy = {
      id: `POL${Date.now()}`,
      userId: application.userId,
      userName: application.userName,
      userEmail: application.userEmail,
      type: application.type,
      status: 'active',
      premium: application.premium,
      coverage: application.coverage,
      startDate: new Date(),
      endDate: new Date(Date.now() + application.duration * 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      approvedAt: new Date(),
      approvedBy: user?.id,
      documents: [],
    };
    
    setPolicies(prev => [newPolicy, ...prev]);
    setLoading(false);
    return true;
  }, [applications, user]);

  const rejectPolicy = useCallback(async (applicationId: string, reason: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setApplications(prev =>
      prev.map(a =>
        a.id === applicationId
          ? { 
              ...a, 
              status: 'rejected' as const, 
              reviewedAt: new Date(), 
              reviewedBy: user?.id,
              rejectionReason: reason 
            }
          : a
      )
    );
    
    setLoading(false);
    return true;
  }, [user]);

  const updatePolicy = useCallback(async (policyId: string, updates: Partial<Policy>): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setPolicies(prev =>
      prev.map(p =>
        p.id === policyId ? { ...p, ...updates } : p
      )
    );
    
    setLoading(false);
    return true;
  }, []);

  const refreshPolicies = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  }, []);

  return {
    policies,
    applications,
    userPolicies,
    pendingApplications,
    loading,
    getPolicyById,
    getApplicationById,
    submitPolicyApplication,
    approvePolicy,
    rejectPolicy,
    updatePolicy,
    refreshPolicies,
  };
}
