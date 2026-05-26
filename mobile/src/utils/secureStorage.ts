import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 1800; // SecureStore limit is ~2KB, leave margin for overhead

function chunkString(str: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

export const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const meta = await SecureStore.getItemAsync(`${key}_meta`);
      if (!meta) {
        // Try direct read (non-chunked)
        return await SecureStore.getItemAsync(key);
      }
      const { chunks: count } = JSON.parse(meta);
      const parts: string[] = [];
      for (let i = 0; i < count; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
        if (chunk === null) return null;
        parts.push(chunk);
      }
      return parts.join('');
    } catch {
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // Clean up old chunks first
      await secureStorage.removeItem(key);

      if (value.length <= CHUNK_SIZE) {
        await SecureStore.setItemAsync(key, value);
        return;
      }

      const chunks = chunkString(value, CHUNK_SIZE);
      await SecureStore.setItemAsync(`${key}_meta`, JSON.stringify({ chunks: chunks.length }));
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(`${key}_${i}`, chunks[i]);
      }
    } catch {
      // Silently fail — cache is best-effort
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      const meta = await SecureStore.getItemAsync(`${key}_meta`);
      if (meta) {
        const { chunks: count } = JSON.parse(meta);
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(`${key}_${i}`);
        }
        await SecureStore.deleteItemAsync(`${key}_meta`);
      }
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Silently fail
    }
  },
};
