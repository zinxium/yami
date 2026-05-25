import { useState, useEffect, useCallback } from 'react';
import { loansApi } from '../api/loans.api';
import { borrowersApi } from '../api/borrowers.api';
import { Loan, Borrower } from '../types';

export function useLoans(filters?: { status?: string; search?: string }) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loansApi.getAll(filters);
      setLoans(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { loans, loading, error, refetch: fetch };
}

export function useLoan(loanId: string) {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loansApi.getById(loanId);
      setLoan(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { loan, loading, error, refetch: fetch };
}

export function useBorrowers() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await borrowersApi.getAll();
      setBorrowers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { borrowers, loading, error, refetch: fetch };
}
