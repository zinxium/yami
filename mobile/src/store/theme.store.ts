import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

interface ThemeStore {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  restoreTheme: () => Promise<void>;
}

const zustandStorage = createJSONStorage(() => ({
  getItem: async (name: string) => {
    try {
      const item = await SecureStore.getItemAsync(name);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {}
  },
  removeItem: async (name: string) => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {}
  },
}));

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),
      restoreTheme: async () => {
        // Theme persisted automatically via middleware
      },
    }),
    {
      name: 'theme-storage',
      storage: zustandStorage,
    }
  )
);
