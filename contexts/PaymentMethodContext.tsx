import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { paymentMethodService } from '@/services/paymentMethod.service';
import { PaymentMethodDto, CreatePaymentMethodDto } from '../types/dto';
import { useAuth } from './AuthContext';

type PaymentMethodContextType = {
  paymentMethods: PaymentMethodDto[];
  loading: boolean;
  refetchPaymentMethods: () => Promise<void>;
  addMethod: (data: CreatePaymentMethodDto) => Promise<void>;
  deleteMethod: (id: string) => Promise<void>;
  setDefaultMethod: (id: string) => Promise<void>;
};

const PaymentMethodContext = createContext<PaymentMethodContextType | null>(null);

export const PaymentMethodProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDto[]>([]);
  const [loading, setLoading] = useState(false);

  const refetchPaymentMethods = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await paymentMethodService.getMyMethods();
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if(user) {
        refetchPaymentMethods();
    }
  }, [user, refetchPaymentMethods]);

  const addMethod = useCallback(async (data: CreatePaymentMethodDto) => {
    await paymentMethodService.addMethod(data);
    await refetchPaymentMethods();
  }, [refetchPaymentMethods]);

  const deleteMethod = useCallback(async (id: string) => {
    await paymentMethodService.deleteMethod(id);
    setPaymentMethods(prev => prev.filter(p => p.id !== id));
  }, []);

  const setDefaultMethod = useCallback(async (id: string) => {
    await paymentMethodService.setDefault(id);
    await refetchPaymentMethods();
  }, [refetchPaymentMethods]);

  return (
    <PaymentMethodContext.Provider value={{ paymentMethods, loading, refetchPaymentMethods, addMethod, deleteMethod, setDefaultMethod }}>
      {children}
    </PaymentMethodContext.Provider>
  );
};

export const usePaymentMethods = () => {
  const context = useContext(PaymentMethodContext);
  if (!context) {
    throw new Error('usePaymentMethods must be used within a PaymentMethodProvider');
  }
  return context;
};