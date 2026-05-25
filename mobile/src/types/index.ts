export interface User {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Borrower {
  id: string;
  user_id: string;
  fullname: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
}

export type DurationUnit = 'months' | 'weeks';
export type LoanStatus   = 'active' | 'paid' | 'overdue';
export type PaymentType  = 'full' | 'partial' | 'advance';

export interface Loan {
  id: string;
  user_id: string;
  borrower_id: string;
  borrower?: Borrower;
  amount: number;
  interest_rate: number;
  duration: number;
  duration_unit: DurationUnit;
  monthly_payment: number;
  total_repayment: number;
  remaining_balance: number;
  currency: string;
  status: LoanStatus;
  start_date: string;
  end_date: string;
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  loan_id: string;
  amount_paid: number;
  payment_type: PaymentType;
  payment_date: string;
  payment_method?: string;
  notes?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export interface ScheduleItem {
  period: number;
  due_date: string;
  amount: number;
  status: 'paid' | 'overdue' | 'upcoming';
}
