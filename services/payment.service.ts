// Description: Service pour gérer les paiements.
// ============================================================
import api from './api';
import { CreatePaymentDto, TransactionDto } from '../types/dto';

export const paymentService = {
    processQrPayment: (paymentData: CreatePaymentDto) => {
        return api.post<TransactionDto>('/payments/qr', paymentData);
    }
}
