import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';
import { User } from '../types';
import { useCacheStore } from './cache.store';
import { useMutationQueueStore } from './mutationQueue.store';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullname: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/api/auth/login',
      { email, password },
    );
    await SecureStore.setItemAsync('access_token', res.accessToken);
    await SecureStore.setItemAsync('refresh_token', res.refreshToken);
    set({ user: res.user, accessToken: res.accessToken, isAuthenticated: true });
  },

  register: async (data) => {
    const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/api/auth/register',
      data,
    );
    await SecureStore.setItemAsync('access_token', res.accessToken);
    await SecureStore.setItemAsync('refresh_token', res.refreshToken);
    set({ user: res.user, accessToken: res.accessToken, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch {
      // Ignore network errors on logout
    }
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    // Clear offline data
    useCacheStore.getState().clearCache();
    useMutationQueueStore.getState().clearQueue();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (refreshToken) {
        try {
          const res = await api.post<{ accessToken: string }>('/api/auth/refresh', { refreshToken });
          await SecureStore.setItemAsync('access_token', res.accessToken);
          set({ accessToken: res.accessToken, isAuthenticated: true, isLoading: false });
        } catch {
          // Offline or token expired — if we have a cached token, stay authenticated
          // so the user can use the app in offline mode
          const cachedLoans = useCacheStore.getState().loans;
          if (cachedLoans.length > 0) {
            set({ accessToken: token, isAuthenticated: true, isLoading: false });
          } else {
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');
            set({ isLoading: false });
          }
        }
      } else {
        set({ accessToken: token, isAuthenticated: true, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
