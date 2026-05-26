import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://yami-production.up.railway.app';

if (!__DEV__ && !API_URL.startsWith('https://')) {
  throw new Error('Production API URL must use HTTPS');
}

async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync('access_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = typeof error.error === 'string' && error.error.length < 200
      ? error.error
      : 'Erreur réseau';
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  get:    <T>(url: string)                  => request<T>(url),
  post:   <T>(url: string, body: unknown)   => request<T>(url, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(url: string, body: unknown)   => request<T>(url, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: <T>(url: string)                  => request<T>(url, { method: 'DELETE' }),
};
