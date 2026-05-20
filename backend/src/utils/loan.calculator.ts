import { DurationUnit } from '@prisma/client';

export interface LoanParams {
  amount: number;
  interestRate: number;
  duration: number;
  durationUnit: DurationUnit;
  startDate: Date;
}

export interface LoanResult {
  interestAmount: number;
  totalRepayment: number;
  periodPayment: number;
  endDate: Date;
}

export function calculateLoan(params: LoanParams): LoanResult {
  const { amount, interestRate, duration, durationUnit, startDate } = params;

  const interestAmount = amount * (interestRate / 100) * duration;
  const totalRepayment = amount + interestAmount;
  const periodPayment = totalRepayment / duration;

  const endDate = new Date(startDate);
  if (durationUnit === 'months') {
    endDate.setMonth(endDate.getMonth() + duration);
  } else {
    endDate.setDate(endDate.getDate() + duration * 7);
  }

  return {
    interestAmount: Math.round(interestAmount * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
    periodPayment: Math.round(periodPayment * 100) / 100,
    endDate,
  };
}

export function generateContractNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `YM-${year}${month}-${random}`;
}
