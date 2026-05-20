import { api } from './client';
import { Loan } from '../types';

export const loansApi = {
  getAll: (filters?: { status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString();
    return api.get<Loan[]>(`/api/loans${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => api.get<Loan>(`/api/loans/${id}`),

  create: (data: {
    borrower_id: string;
    amount: number;
    interest_rate: number;
    duration: number;
    duration_unit: string;
    start_date: string;
    notes?: string;
  }) => api.post<Loan>('/api/loans', data),

  update: (id: string, data: Partial<Loan>) => api.put<Loan>(`/api/loans/${id}`, data),

  delete: (id: string) => api.delete(`/api/loans/${id}`),

  markAsPaid: (id: string) => api.put<Loan>(`/api/loans/${id}/paid`, {}),

  getSchedule: (id: string) =>
    api.get<{ period: number; due_date: string; amount: number; status: string }[]>(`/api/loans/${id}/schedule`),

  getTicket: (id: string) => api.get<{ ticket: string }>(`/api/loans/${id}/ticket`),
};
