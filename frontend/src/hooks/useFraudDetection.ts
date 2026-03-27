import { useState, useEffect, useCallback } from 'react';
import type { FlaggedClaim } from '@/types';
import { mockFlaggedClaims } from '@/services/mockData';

interface FraudStats {
  totalChecked: number;
  flaggedCount: number;
  accuracy: number;
  avgRiskScore: number;
}

interface UseFraudDetectionReturn {
  flaggedClaims: FlaggedClaim[];
  stats: FraudStats;
  loading: boolean;
  selectedClaim: FlaggedClaim | null;
  selectClaim: (claim: FlaggedClaim | null) => void;
  approveClaim: (claimId: string) => void;
  rejectClaim: (claimId: string) => void;
  refreshClaims: () => void;
  filterByRisk: (minScore: number, maxScore: number) => void;
}

export function useFraudDetection(): UseFraudDetectionReturn {
  const [flaggedClaims, setFlaggedClaims] = useState<FlaggedClaim[]>(mockFlaggedClaims);
  const [loading, setLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<FlaggedClaim | null>(null);
  const [filteredClaims, setFilteredClaims] = useState<FlaggedClaim[]>(mockFlaggedClaims);
  const [riskFilter, setRiskFilter] = useState<{ min: number; max: number } | null>(null);

  const stats: FraudStats = {
    totalChecked: 1247,
    flaggedCount: flaggedClaims.length,
    accuracy: 95.2,
    avgRiskScore: Math.round(
      flaggedClaims.reduce((sum, claim) => sum + claim.riskScore, 0) / flaggedClaims.length
    ),
  };

  const refreshClaims = useCallback(() => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Randomly update some claim statuses
      setFlaggedClaims(prev =>
        prev.map(claim => ({
          ...claim,
          riskScore: Math.min(100, Math.max(0, claim.riskScore + Math.floor(Math.random() * 10 - 5))),
        }))
      );
      setLoading(false);
    }, 800);
  }, []);

  const selectClaim = useCallback((claim: FlaggedClaim | null) => {
    setSelectedClaim(claim);
  }, []);

  const approveClaim = useCallback((claimId: string) => {
    setFlaggedClaims(prev =>
      prev.map(claim =>
        claim.id === claimId ? { ...claim, status: 'approved' as const } : claim
      )
    );
  }, []);

  const rejectClaim = useCallback((claimId: string) => {
    setFlaggedClaims(prev =>
      prev.map(claim =>
        claim.id === claimId ? { ...claim, status: 'rejected' as const } : claim
      )
    );
  }, []);

  const filterByRisk = useCallback((minScore: number, maxScore: number) => {
    setRiskFilter({ min: minScore, max: maxScore });
  }, []);

  // Apply risk filter
  useEffect(() => {
    if (riskFilter) {
      setFilteredClaims(
        flaggedClaims.filter(
          claim =>
            claim.riskScore >= riskFilter.min && claim.riskScore <= riskFilter.max
        )
      );
    } else {
      setFilteredClaims(flaggedClaims);
    }
  }, [flaggedClaims, riskFilter]);

  // Auto-refresh claims every 60 seconds
  useEffect(() => {
    const interval = setInterval(refreshClaims, 60000);
    return () => clearInterval(interval);
  }, [refreshClaims]);

  return {
    flaggedClaims: filteredClaims,
    stats,
    loading,
    selectedClaim,
    selectClaim,
    approveClaim,
    rejectClaim,
    refreshClaims,
    filterByRisk,
  };
}
