import { User, Borrower, Loan, Payment } from '../types';

export const mockUser: User = {
  id: 'u1',
  fullname: 'Cynthia Zinsou',
  email: 'cynthia@yami.app',
  phone: '+229 97 00 00 00',
  created_at: '2026-01-15T10:00:00Z',
};

export const mockBorrowers: Borrower[] = [
  {
    id: 'b1',
    user_id: 'u1',
    fullname: 'Adebayo Okonkwo',
    phone: '+234 801 234 5678',
    address: 'Lagos, Nigeria',
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'b2',
    user_id: 'u1',
    fullname: 'Musa Diallo',
    phone: '+221 77 123 45 67',
    address: 'Dakar, Senegal',
    created_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'b3',
    user_id: 'u1',
    fullname: 'Rumansnrma Toure',
    phone: '+225 07 00 00 00',
    address: 'Abidjan, Cote d\'Ivoire',
    created_at: '2026-04-01T10:00:00Z',
  },
  {
    id: 'b4',
    user_id: 'u1',
    fullname: 'Funke Risem',
    phone: '+234 802 345 6789',
    address: 'Ibadan, Nigeria',
    created_at: '2026-04-15T10:00:00Z',
  },
];

export const mockLoans: Loan[] = [
  {
    id: 'l1',
    user_id: 'u1',
    borrower_id: 'b1',
    borrower: mockBorrowers[0],
    amount: 1200,
    interest_rate: 5,
    duration: 6,
    duration_unit: 'months',
    monthly_payment: 210,
    total_repayment: 1260,
    remaining_balance: 840,
    currency: 'USD',
    status: 'active',
    start_date: '2026-09-15T00:00:00Z',
    end_date: '2027-03-15T00:00:00Z',
    created_at: '2026-09-15T10:00:00Z',
  },
  {
    id: 'l2',
    user_id: 'u1',
    borrower_id: 'b2',
    borrower: mockBorrowers[1],
    amount: 150,
    interest_rate: 3,
    duration: 5,
    duration_unit: 'months',
    monthly_payment: 30.9,
    total_repayment: 154.5,
    remaining_balance: 154.5,
    currency: 'USD',
    status: 'active',
    start_date: '2026-10-01T00:00:00Z',
    end_date: '2027-03-01T00:00:00Z',
    created_at: '2026-10-01T10:00:00Z',
  },
  {
    id: 'l3',
    user_id: 'u1',
    borrower_id: 'b3',
    borrower: mockBorrowers[2],
    amount: 950,
    interest_rate: 7,
    duration: 9,
    duration_unit: 'months',
    monthly_payment: 113.17,
    total_repayment: 1018.5,
    remaining_balance: 1018.5,
    currency: 'USD',
    status: 'overdue',
    start_date: '2026-06-01T00:00:00Z',
    end_date: '2027-03-01T00:00:00Z',
    created_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'l4',
    user_id: 'u1',
    borrower_id: 'b4',
    borrower: mockBorrowers[3],
    amount: 100,
    interest_rate: 2,
    duration: 3,
    duration_unit: 'months',
    monthly_payment: 34,
    total_repayment: 102,
    remaining_balance: 0,
    currency: 'USD',
    status: 'paid',
    start_date: '2026-01-01T00:00:00Z',
    end_date: '2026-04-01T00:00:00Z',
    notes: 'Rembourse en avance',
    created_at: '2026-01-01T10:00:00Z',
  },
];

export const mockPayments: Payment[] = [
  { id: 'p1', loan_id: 'l1', amount_paid: 210, payment_type: 'partial', payment_date: '2026-10-15T00:00:00Z', payment_method: 'Cash' },
  { id: 'p2', loan_id: 'l1', amount_paid: 210, payment_type: 'partial', payment_date: '2026-11-15T00:00:00Z', payment_method: 'Cash' },
  { id: 'p3', loan_id: 'l4', amount_paid: 102, payment_type: 'full', payment_date: '2026-03-01T00:00:00Z', payment_method: 'Mobile Money' },
];

export const dashboardStats = {
  totalLent: mockLoans.reduce((sum, l) => sum + l.amount, 0),
  totalRepaid: mockPayments.reduce((sum, p) => sum + p.amount_paid, 0),
  activeLoansCount: mockLoans.filter((l) => l.status === 'active').length,
};

export function getLoanById(id: string): Loan | undefined {
  return mockLoans.find((l) => l.id === id);
}

export function getBorrowerLoans(borrowerId: string): Loan[] {
  return mockLoans.filter((l) => l.borrower_id === borrowerId);
}
