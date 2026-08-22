import axios from 'axios';
import { User, AuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('globetrotter_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },
  signup: async (data: { name: string; email: string; password: string; language?: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/signup', data);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data.user || (res.data as any);
  },
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const res = await api.put<{ user: User }>('/auth/profile', userData);
    return res.data.user || (res.data as any);
  },
  deleteAccount: async (): Promise<void> => {
    await api.delete('/auth/profile');
  },
};