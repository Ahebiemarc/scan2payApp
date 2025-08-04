// Description: Provider pour gérer la logique de paiement.
// ============================================================
import React, { createContext, useContext, useState, useCallback } from 'react';
import { paymentService } from '../services/payment.service';
import { CreatePaymentDto, TransactionDto } from '../types/dto';
import { Alert } from 'react-native';
import { useWallet } from './WalletContext';

type PaymentContextType = {
  isProcessing: boolean;
  error: string | null;
  processQrPayment: (paymentData: CreatePaymentDto) => Promise<TransactionDto | null>;
};

const PaymentContext = createContext<PaymentContextType | null>(null);

export const PaymentProvider = ({ children }: { children: React.ReactNode }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refetchWalletData } = useWallet(); // Récupère la fonction de rafraîchissement

  const processQrPayment = useCallback(
    async (paymentData: CreatePaymentDto): Promise<TransactionDto | null> => {
      setIsProcessing(true);
      setError(null);
      try {
        const response = await paymentService.processQrPayment(paymentData);
        // Après un paiement réussi, rafraîchir les données du portefeuille
        await refetchWalletData();
        Alert.alert("Succès", "Votre paiement a été effectué avec succès.");
        return response.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Une erreur est survenue lors du paiement.';
        setError(errorMessage);
        Alert.alert("Échec du Paiement", errorMessage);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [refetchWalletData] // Dépend de la fonction de rafraîchissement
  );

  return (
    <PaymentContext.Provider value={{ isProcessing, error, processQrPayment }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};