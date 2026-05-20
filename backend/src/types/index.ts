import { Request } from 'express';

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface LoanCalculation {
  interestAmount: number;
  totalRepayment: number;
  periodPayment: number;
  endDate: Date;
}
