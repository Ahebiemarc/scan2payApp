// Description: Service pour gérer le portefeuille et les transactions.
// ============================================================
import api from './api';
import { WalletDto, TransactionDto, TopUpRequestDto, WithdrawalRequestDto } from '../types/dto';

export const walletService = {
  getMyWallet: () => {
    return api.get<WalletDto>('/wallets/my-wallet');
  },
  getTransactions: (pageNumber = 1, pageSize = 20) => {
    return api.get<TransactionDto[]>(`/wallets/my-wallet/transactions`, {
        params: { pageNumber, pageSize }
    });
  },
  topUp: (topUpData: TopUpRequestDto) => {
            console.log("loginData: ", topUpData);

    return api.post<TransactionDto>('/wallets/topup', topUpData);
  },

  withdraw: (withdrawData: WithdrawalRequestDto) => {
            console.log("withdrawData: ", withdrawData);

    return api.post<TransactionDto>('/wallets/withdraw', withdrawData);
  },
  
};