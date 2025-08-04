// File: services/paymentMethod.service.ts (NOUVEAU)
import api from './api';
import { PaymentMethodDto, CreatePaymentMethodDto } from '../types/dto';

export const paymentMethodService = {
  getMyMethods: () => {
    return api.get<PaymentMethodDto[]>('/paymentmethods/my-methods');
  },
  addMethod: (data: CreatePaymentMethodDto) => {
    return api.post<PaymentMethodDto>('/paymentmethods', data);
  },
  deleteMethod: (id: string) => {
    return api.delete(`/paymentmethods/${id}`);
  },
  setDefault: (id: string) => {
    return api.put(`/paymentmethods/${id}/set-default`);
  },
};