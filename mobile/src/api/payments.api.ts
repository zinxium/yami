import { api } from './client';
import { Payment } from '../types';

export const paymentsApi = {
  getByLoan: (loanId: string) => api.get<Payment[]>(`/api/payments/${loanId}`),

  create: (data: {
    loan_id: string;
    amount_paid: number;
    payment_type: string;
    payment_date: string;
    payment_method?: string;
    notes?: string;
  }) => api.post<Payment>('/api/payments', data),

  delete: (id: string) => api.delete(`/api/payments/${id}`),
};
