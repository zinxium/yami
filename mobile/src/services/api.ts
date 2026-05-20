import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com', // Remplacez par l'URL de votre backend
  timeout: 10000,
});

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signup = async (name: string, email: string, password: string) => {
  const response = await api.post('/auth/signup', { name, email, password });
  return response.data;
};

export default api;