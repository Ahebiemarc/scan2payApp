// Description: Hook pour gérer l'état du portefeuille.
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { walletService } from '../services/wallet.service';
import { WalletDto, TransactionDto } from '../types/dto';

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletDto | null>(null);
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const walletResponse = await walletService.getMyWallet();
      setWallet(walletResponse.data);
      
      const transactionsResponse = await walletService.getTransactions();
      setTransactions(transactionsResponse.data);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des données du portefeuille.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { wallet, transactions, loading, error, refetch: fetchData };
};