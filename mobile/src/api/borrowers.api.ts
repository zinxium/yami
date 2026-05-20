import { api } from './client';
import { Borrower } from '../types';

export const borrowersApi = {
  getAll: () => api.get<Borrower[]>('/api/borrowers'),

  getById: (id: string) => api.get<Borrower>(`/api/borrowers/${id}`),

  create: (data: { fullname: string; phone?: string; address?: string; notes?: string }) =>
    api.post<Borrower>('/api/borrowers', data),

  update: (id: string, data: Partial<Borrower>) =>
    api.put<Borrower>(`/api/borrowers/${id}`, data),

  delete: (id: string) => api.delete(`/api/borrowers/${id}`),
};
