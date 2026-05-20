import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';
import { User } from '../types';

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
    await api.post('/api/auth/logout', {});
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      // Validate token by fetching user profile — on utilise le refresh si besoin
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (refreshToken) {
        try {
          const res = await api.post<{ accessToken: string }>('/api/auth/refresh', { refreshToken });
          await SecureStore.setItemAsync('access_token', res.accessToken);
          set({ accessToken: res.accessToken, isAuthenticated: true, isLoading: false });
        } catch {
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('refresh_token');
          set({ isLoading: false });
        }
      } else {
        set({ accessToken: token, isAuthenticated: true, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
