import { useState, useEffect, useCallback } from 'react';
import type { Transaction, PaymentStats } from '@/types';
import { mockTransactions } from '@/services/mockData';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface UsePaymentsReturn {
  transactions: Transaction[];
  stats: PaymentStats;
  loading: boolean;
  processingPayment: boolean;
  selectedTransaction: Transaction | null;
  refreshTransactions: () => void;
  selectTransaction: (transaction: Transaction | null) => void;
  initiatePayment: (amount: number, workerId: string, workerName: string, purpose: string) => Promise<boolean>;
  verifyPayment: (response: RazorpayResponse) => Promise<boolean>;
}

// Simulate Razorpay order creation
const createRazorpayOrder = async (amount: number): Promise<{ id: string; amount: number }> => {
  // In production, this would be a server API call
  // const response = await fetch('/api/create-order', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ amount, currency: 'INR' }),
  // });
  // return response.json();
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: `order_${Date.now()}`,
    amount: amount * 100, // Convert to paise
  };
};

export function usePayments(): UsePaymentsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const stats: PaymentStats = {
    totalProcessed: transactions
      .filter(t => t.status === 'success')
      .reduce((sum, t) => sum + t.amount, 0),
    successRate: Math.round(
      (transactions.filter(t => t.status === 'success').length / transactions.length) * 100
    ),
    pending: transactions.filter(t => t.status === 'pending').length,
    failed: transactions.filter(t => t.status === 'failed').length,
  };

  const refreshTransactions = useCallback(() => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const selectTransaction = useCallback((transaction: Transaction | null) => {
    setSelectedTransaction(transaction);
  }, []);

  const initiatePayment = useCallback(
    async (amount: number, workerId: string, workerName: string, purpose: string): Promise<boolean> => {
      setProcessingPayment(true);
      
      try {
        // Create Razorpay order
        const order = await createRazorpayOrder(amount);
        
        // Add pending transaction
        const newTransaction: Transaction = {
          id: `TXN${Date.now()}`,
          amount,
          currency: 'INR',
          status: 'pending',
          workerId,
          workerName,
          purpose,
          createdAt: new Date(),
          razorpayOrderId: order.id,
        };
        
        setTransactions(prev => [newTransaction, ...prev]);
        
        // In production, this would open the Razorpay checkout
        // const options = {
        //   key: process.env.RAZORPAY_KEY_ID,
        //   amount: order.amount,
        //   currency: 'INR',
        //   order_id: order.id,
        //   handler: (response: RazorpayResponse) => {
        //     verifyPayment(response);
        //   },
        //   prefill: {
        //     name: workerName,
        //   },
        // };
        // const rzp = new (window as any).Razorpay(options);
        // rzp.open();
        
        // Simulate successful payment for demo
        setTimeout(() => {
          setTransactions(prev =>
            prev.map(t =>
              t.id === newTransaction.id
                ? {
                    ...t,
                    status: 'success',
                    razorpayPaymentId: `pay_${Date.now()}`,
                  }
                : t
            )
          );
        }, 3000);
        
        return true;
      } catch (error) {
        console.error('Payment initiation failed:', error);
        return false;
      } finally {
        setProcessingPayment(false);
      }
    },
    []
  );

  const verifyPayment = useCallback(async (_response: RazorpayResponse): Promise<boolean> => {
    // In production, this would verify the payment signature on the server
    // const verification = await fetch('/api/verify-payment', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(response),
    // });
    // return verification.ok;
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }, []);

  // Auto-refresh transactions every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshTransactions, 30000);
    return () => clearInterval(interval);
  }, [refreshTransactions]);

  return {
    transactions,
    stats,
    loading,
    processingPayment,
    selectedTransaction,
    refreshTransactions,
    selectTransaction,
    initiatePayment,
    verifyPayment,
  };
}
