import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Loan, Borrower, Payment, ScheduleItem } from '../types';

interface CacheState {
  loans: Loan[];
  borrowers: Borrower[];
  paymentsPerLoan: Record<string, Payment[]>;
  schedulesPerLoan: Record<string, ScheduleItem[]>;
  lastSyncedAt: string | null;

  setLoans: (loans: Loan[]) => void;
  setBorrowers: (borrowers: Borrower[]) => void;
  setPayments: (loanId: string, payments: Payment[]) => void;
  setSchedule: (loanId: string, schedule: ScheduleItem[]) => void;
  addLoan: (loan: Loan) => void;
  addBorrower: (borrower: Borrower) => void;
  addPayment: (loanId: string, payment: Payment) => void;
  updateLoan: (id: string, data: Partial<Loan>) => void;
  removeLoan: (id: string) => void;
  removeBorrower: (id: string) => void;
  removePayment: (id: string, loanId: string) => void;
  clearCache: () => void;
}

export const useCacheStore = create<CacheState>()(
  persist(
    (set) => ({
      loans: [],
      borrowers: [],
      paymentsPerLoan: {},
      schedulesPerLoan: {},
      lastSyncedAt: null,

      setLoans: (loans) => set({ loans, lastSyncedAt: new Date().toISOString() }),
      setBorrowers: (borrowers) => set({ borrowers }),
      setPayments: (loanId, payments) =>
        set((s) => ({ paymentsPerLoan: { ...s.paymentsPerLoan, [loanId]: payments } })),
      setSchedule: (loanId, schedule) =>
        set((s) => ({ schedulesPerLoan: { ...s.schedulesPerLoan, [loanId]: schedule } })),

      addLoan: (loan) => set((s) => ({ loans: [loan, ...s.loans] })),
      addBorrower: (borrower) => set((s) => ({ borrowers: [borrower, ...s.borrowers] })),
      addPayment: (loanId, payment) =>
        set((s) => ({
          paymentsPerLoan: {
            ...s.paymentsPerLoan,
            [loanId]: [payment, ...(s.paymentsPerLoan[loanId] || [])],
          },
        })),

      updateLoan: (id, data) =>
        set((s) => ({
          loans: s.loans.map((l) => (l.id === id ? { ...l, ...data } : l)),
        })),

      removeLoan: (id) => set((s) => ({ loans: s.loans.filter((l) => l.id !== id) })),
      removeBorrower: (id) => set((s) => ({ borrowers: s.borrowers.filter((b) => b.id !== id) })),
      removePayment: (id, loanId) =>
        set((s) => ({
          paymentsPerLoan: {
            ...s.paymentsPerLoan,
            [loanId]: (s.paymentsPerLoan[loanId] || []).filter((p) => p.id !== id),
          },
        })),

      clearCache: () =>
        set({
          loans: [],
          borrowers: [],
          paymentsPerLoan: {},
          schedulesPerLoan: {},
          lastSyncedAt: null,
        }),
    }),
    {
      name: 'yami-cache',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
