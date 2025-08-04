import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { walletService } from '../services/wallet.service';
import { WalletDto, TransactionDto, TopUpRequestDto, WithdrawalRequestDto } from '../types/dto'; // Importez TopUpRequestDto
import { useAuth } from './AuthContext';
import { AxiosError } from 'axios'; // Importez AxiosError pour une meilleure gestion des erreurs API

type WalletContextType = {
  wallet: WalletDto | null;
  transactions: TransactionDto[];
  loading: boolean;
  error: string | null;
  refetchWalletData: () => Promise<void>;
  // --- NOUVELLES FONCTIONS AJOUTÉES ---
  topUp: (amount: number, paymentMethodId: string, description?: string, currency?: string) => Promise<TransactionDto | null>;
  withdraw: (amount: number, destinationPaymentMethodId: string, description?: string, currency?: string) => Promise<TransactionDto | null>;
  // --- FIN NOUVELLES FONCTIONS ---
};

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState<WalletDto | null>(null);
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState(false); // Pour les opérations topUp/withdraw
  const [operationError, setOperationError] = useState<string | null>(null); // Pour les erreurs spécifiques d'opération

  const refetchWalletData = useCallback(async () => {
    // Vérifiez si l'utilisateur est authentifié et si son ID est disponible pour éviter les appels inutiles
    if (!user?.id || !isAuthenticated) {
        setLoading(false); // S'assurer que le loader s'arrête si pas d'utilisateur
        setWallet(null);
        setTransactions([]);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        walletService.getMyWallet(),
        walletService.getTransactions(),
      ]);
      setWallet(walletRes.data);
      setTransactions(transactionsRes.data);
    } catch (err: any) {
        console.error("Erreur lors de la récupération des données du portefeuille:", err);
        let errorMessage = 'Erreur lors de la récupération du portefeuille.';
        if (err instanceof AxiosError && err.response?.data?.message) {
            errorMessage = err.response.data.message;
        } else if (err.message) {
            errorMessage = err.message;
        }
        setError(errorMessage);
        setWallet(null); // Réinitialiser le portefeuille en cas d'erreur
        setTransactions([]); // Réinitialiser les transactions
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]); // Dépend de user et isAuthenticated

  // --- Implémentation de topUp ---
  const topUp = useCallback(async (amount: number, paymentMethodId: string, description?: string, currency?: string): Promise<TransactionDto | null> => {
    if (!isAuthenticated) { // userId n'est plus dans le DTO, mais vérifiez l'authentification
      setOperationError("Vous devez être authentifié pour effectuer un rechargement.");
      return null;
    }

    setOperationLoading(true);
    setOperationError(null);
    try {
      const topUpData: TopUpRequestDto = {
        amount: amount,
        paymentMethodId: paymentMethodId,
        currency: currency || "EUR", // Utilisez la devise par défaut si non fournie
        type: "topup"
        // userId n'est plus envoyé car le backend l'extrait des claims
      };
      const response = await walletService.topUp(topUpData);
      await refetchWalletData(); // Mettre à jour les données du portefeuille après un top-up réussi
      return response.data;
    } catch (err: any) {
        console.error("Erreur lors du rechargement:", err);
        let errorMessage = 'Échec du rechargement.';
        if (err instanceof AxiosError) {
            errorMessage = err.response?.data?.message || err.message;
        } else if (err.message) {
            errorMessage = err.message;
        }
        setOperationError(errorMessage);
        return null;
    } finally {
      setOperationLoading(false);
    }
  }, [isAuthenticated, refetchWalletData]); // Dépend de isAuthenticated, refetchWalletData

  // --- Implémentation de withdraw ---
  const withdraw = useCallback(async (amount: number, destinationPaymentMethodId: string, description?: string, currency?: string): Promise<TransactionDto | null> => {
    if (!isAuthenticated) { // Vérifiez l'authentification
      setOperationError("Vous devez être authentifié pour effectuer un retrait.");
      return null;
    }

    setOperationLoading(true);
    setOperationError(null);
    try {
      const withdrawData: WithdrawalRequestDto = {
        amount: amount,
        destinationPaymentMethodId: destinationPaymentMethodId,
        currency: currency || "EUR", // Utilisez la devise par défaut si non fournie
        description: description,
        // userId n'est plus envoyé car le backend l'extrait des claims
      };
      const response = await walletService.withdraw(withdrawData);
      await refetchWalletData(); // Mettre à jour les données du portefeuille après un retrait réussi
      return response.data;
    } catch (err: any) {
        console.error("Erreur lors du retrait:", err);
        let errorMessage = 'Échec du retrait.';
        if (err instanceof AxiosError) {
            errorMessage = err.response?.data?.message || err.message;
        } else if (err.message) {
            errorMessage = err.message;
        }
        setOperationError(errorMessage);
        return null;
    } finally {
      setOperationLoading(false);
    }
  }, [isAuthenticated, refetchWalletData]); // Dépend de isAuthenticated, refetchWalletData

  useEffect(() => {
    if(user?.id){ // Assurez-vous que user.id est défini avant de chercher les données
        refetchWalletData();
    }
  }, [user, refetchWalletData]);

  return (
    <WalletContext.Provider value={{
      wallet,
      transactions,
      loading,
      error,
      refetchWalletData,
      topUp,       // Ajoutez topUp
      withdraw     // Ajoutez withdraw
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};