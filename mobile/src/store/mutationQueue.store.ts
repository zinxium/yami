import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { secureStorage } from '../utils/secureStorage';

export type MutationType =
  | 'CREATE_LOAN'
  | 'UPDATE_LOAN'
  | 'DELETE_LOAN'
  | 'MARK_LOAN_PAID'
  | 'CREATE_PAYMENT'
  | 'DELETE_PAYMENT'
  | 'CREATE_BORROWER'
  | 'UPDATE_BORROWER'
  | 'DELETE_BORROWER';

export interface QueuedMutation {
  id: string;
  type: MutationType;
  payload: Record<string, unknown>;
  createdAt: string;
  status: 'pending' | 'processing' | 'failed';
  retryCount: number;
  error?: string;
}

interface MutationQueueState {
  queue: QueuedMutation[];
  addMutation: (type: MutationType, payload: Record<string, unknown>) => string;
  removeMutation: (id: string) => void;
  markProcessing: (id: string) => void;
  markFailed: (id: string, error: string) => void;
  clearQueue: () => void;
}

export const useMutationQueueStore = create<MutationQueueState>()(
  persist(
    (set, get) => ({
      queue: [],

      addMutation: (type, payload) => {
        const id = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        set((s) => ({
          queue: [
            ...s.queue,
            { id, type, payload, createdAt: new Date().toISOString(), status: 'pending', retryCount: 0 },
          ],
        }));
        return id;
      },

      removeMutation: (id) => set((s) => ({ queue: s.queue.filter((m) => m.id !== id) })),

      markProcessing: (id) =>
        set((s) => ({
          queue: s.queue.map((m) => (m.id === id ? { ...m, status: 'processing' as const } : m)),
        })),

      markFailed: (id, error) =>
        set((s) => ({
          queue: s.queue.map((m) =>
            m.id === id ? { ...m, status: 'failed' as const, error, retryCount: m.retryCount + 1 } : m,
          ),
        })),

      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'yami-mutation-queue',
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
