import { api } from './client';

export interface Contract {
  id: string;
  loan_id: string;
  contract_number: string;
  pdf_url?: string;
  qr_code?: string;
  signed: boolean;
  created_at: string;
}

export const contractsApi = {
  generate: (loan_id: string) =>
    api.post<Contract>('/api/contracts/generate', { loan_id }),

  getByLoanId: (loanId: string) =>
    api.get<Contract | null>(`/api/contracts/loan/${loanId}`),

  sign: (contractId: string) =>
    api.put<Contract>(`/api/contracts/${contractId}/sign`, {}),
};
