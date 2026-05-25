import { useMutationQueueStore, QueuedMutation } from '../store/mutationQueue.store';
import { useCacheStore } from '../store/cache.store';
import { loansApi } from '../api/loans.api';
import { borrowersApi } from '../api/borrowers.api';
import { paymentsApi } from '../api/payments.api';

const MAX_RETRIES = 3;

// Map temp IDs to real server IDs during a sync pass
const tempIdMap = new Map<string, string>();

function resolveId(id: string): string {
  return tempIdMap.get(id) || id;
}

async function executeMutation(mutation: QueuedMutation): Promise<void> {
  const { type, payload } = mutation;

  switch (type) {
    case 'CREATE_BORROWER': {
      const result = await borrowersApi.create(payload as { fullname: string; phone?: string; address?: string; notes?: string });
      // Map temp borrower ID if one was stored
      if (payload.tempId) {
        tempIdMap.set(payload.tempId as string, result.id);
      }
      break;
    }
    case 'UPDATE_BORROWER': {
      const id = resolveId(payload.id as string);
      const { id: _, tempId: __, ...data } = payload;
      await borrowersApi.update(id, data);
      break;
    }
    case 'DELETE_BORROWER': {
      const id = resolveId(payload.id as string);
      await borrowersApi.delete(id);
      break;
    }
    case 'CREATE_LOAN': {
      const borrowerId = resolveId(payload.borrower_id as string);
      const result = await loansApi.create({
        ...payload as { amount: number; interest_rate: number; duration: number; duration_unit: string; start_date: string; notes?: string },
        borrower_id: borrowerId,
      });
      if (payload.tempId) {
        tempIdMap.set(payload.tempId as string, result.id);
      }
      break;
    }
    case 'UPDATE_LOAN': {
      const id = resolveId(payload.id as string);
      const { id: _, tempId: __, ...data } = payload;
      await loansApi.update(id, data);
      break;
    }
    case 'DELETE_LOAN': {
      const id = resolveId(payload.id as string);
      await loansApi.delete(id);
      break;
    }
    case 'MARK_LOAN_PAID': {
      const id = resolveId(payload.id as string);
      await loansApi.markAsPaid(id);
      break;
    }
    case 'CREATE_PAYMENT': {
      const loanId = resolveId(payload.loan_id as string);
      await paymentsApi.create({
        ...payload as { amount_paid: number; payment_type: string; payment_date: string; payment_method?: string; notes?: string },
        loan_id: loanId,
      });
      break;
    }
    case 'DELETE_PAYMENT': {
      const id = resolveId(payload.id as string);
      await paymentsApi.delete(id);
      break;
    }
  }
}

export async function processMutationQueue(): Promise<{ processed: number; failed: number }> {
  const store = useMutationQueueStore.getState();
  const pending = store.queue.filter((m) => m.status === 'pending' || (m.status === 'failed' && m.retryCount < MAX_RETRIES));

  let processed = 0;
  let failed = 0;

  tempIdMap.clear();

  for (const mutation of pending) {
    store.markProcessing(mutation.id);
    try {
      await executeMutation(mutation);
      store.removeMutation(mutation.id);
      processed++;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue';
      store.markFailed(mutation.id, msg);
      failed++;
    }
  }

  return { processed, failed };
}

export async function refreshCache(): Promise<void> {
  const cache = useCacheStore.getState();
  try {
    const [loans, borrowers] = await Promise.all([
      loansApi.getAll(),
      borrowersApi.getAll(),
    ]);
    cache.setLoans(loans);
    cache.setBorrowers(borrowers);
  } catch {
    // Silently fail — keep existing cache
  }
}

export async function syncAll(): Promise<{ processed: number; failed: number }> {
  const result = await processMutationQueue();
  await refreshCache();
  return result;
}
