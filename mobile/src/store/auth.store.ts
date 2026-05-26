import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';
import { User } from '../types';
import { useCacheStore } from './cache.store';
import { useMutationQueueStore } from './mutationQueue.store';

const USER_STORAGE_KEY = 'user_data';

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
    await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(res.user));
    set({ user: res.user, accessToken: res.accessToken, isAuthenticated: true });
  },

  register: async (data) => {
    const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
      '/api/auth/register',
      data,
    );
    await SecureStore.setItemAsync('access_token', res.accessToken);
    await SecureStore.setItemAsync('refresh_token', res.refreshToken);
    await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(res.user));
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
    await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
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

      // Restore cached user data
      let savedUser: User | null = null;
      try {
        const userData = await SecureStore.getItemAsync(USER_STORAGE_KEY);
        if (userData) savedUser = JSON.parse(userData);
      } catch {}

      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (refreshToken) {
        try {
          const res = await api.post<{ accessToken: string }>('/api/auth/refresh', { refreshToken });
          await SecureStore.setItemAsync('access_token', res.accessToken);
          await SecureStore.setItemAsync('last_refresh_at', String(Date.now()));
          set({ user: savedUser, accessToken: res.accessToken, isAuthenticated: true, isLoading: false });
          // Fetch fresh user profile in background
          try {
            const profile = await api.get<{ user: User }>('/api/auth/me');
            await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(profile.user));
            set({ user: profile.user });
          } catch {}
        } catch {
          // Offline or token expired — allow offline mode with time limit
          const cachedLoans = useCacheStore.getState().loans;
          const lastRefresh = await SecureStore.getItemAsync('last_refresh_at');
          const MAX_OFFLINE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
          const isStale = lastRefresh && (Date.now() - Number(lastRefresh)) > MAX_OFFLINE_MS;

          if (cachedLoans.length > 0 && !isStale) {
            set({ user: savedUser, accessToken: token, isAuthenticated: true, isLoading: false });
          } else {
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');
            await SecureStore.deleteItemAsync('last_refresh_at');
            await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
            useCacheStore.getState().clearCache();
            set({ isLoading: false });
          }
        }
      } else {
        set({ user: savedUser, accessToken: token, isAuthenticated: true, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
