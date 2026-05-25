import { useState, useEffect, useCallback } from 'react';
import { loansApi } from '../api/loans.api';
import { borrowersApi } from '../api/borrowers.api';
import { useCacheStore } from '../store/cache.store';
import { useNetworkStore } from '../store/network.store';
import { Loan, Borrower } from '../types';

export function useLoans(filters?: { status?: string; search?: string }) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isConnected = useNetworkStore((s) => s.isConnected);
  const { loans: cachedLoans, setLoans: setCachedLoans } = useCacheStore();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isConnected) {
        const data = await loansApi.getAll(filters);
        setLoans(data);
        setCachedLoans(data);
      } else {
        // Filtrage client-side sur le cache
        let data = cachedLoans;
        if (filters?.status) data = data.filter((l) => l.status === filters.status);
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          data = data.filter((l) => l.borrower?.fullname.toLowerCase().includes(q));
        }
        setLoans(data);
      }
    } catch (e: unknown) {
      // Fallback au cache en cas d'erreur réseau
      let data = cachedLoans;
      if (filters?.status) data = data.filter((l) => l.status === filters.status);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        data = data.filter((l) => l.borrower?.fullname.toLowerCase().includes(q));
      }
      setLoans(data);
      if (data.length === 0) {
        setError(e instanceof Error ? e.message : 'Erreur inconnue');
      }
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.search, isConnected]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { loans, loading, error, refetch: fetch };
}

export function useLoan(loanId: string) {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isConnected = useNetworkStore((s) => s.isConnected);
  const cachedLoans = useCacheStore((s) => s.loans);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      if (isConnected) {
        const data = await loansApi.getById(loanId);
        setLoan(data);
      } else {
        const cached = cachedLoans.find((l) => l.id === loanId) || null;
        setLoan(cached);
      }
    } catch (e: unknown) {
      const cached = cachedLoans.find((l) => l.id === loanId) || null;
      setLoan(cached);
      if (!cached) setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [loanId, isConnected]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { loan, loading, error, refetch: fetch };
}

export function useBorrowers() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isConnected = useNetworkStore((s) => s.isConnected);
  const { borrowers: cachedBorrowers, setBorrowers: setCachedBorrowers } = useCacheStore();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      if (isConnected) {
        const data = await borrowersApi.getAll();
        setBorrowers(data);
        setCachedBorrowers(data);
      } else {
        setBorrowers(cachedBorrowers);
      }
    } catch (e: unknown) {
      setBorrowers(cachedBorrowers);
      if (cachedBorrowers.length === 0) {
        setError(e instanceof Error ? e.message : 'Erreur inconnue');
      }
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { borrowers, loading, error, refetch: fetch };
}
