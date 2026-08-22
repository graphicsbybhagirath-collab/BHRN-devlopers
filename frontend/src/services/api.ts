import axios from 'axios';
import {
  User,
  City,
  Activity,
  Trip,
  TripStop,
  ItineraryActivity,
  Expense,
  BudgetSummary,
  SharedTripResponse,
  PublicTripView,
  AnalyticsData,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Inject JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('globetrotter_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/shared/')) {
      // If token expired, clear and optionally redirect to login
      if (localStorage.getItem('globetrotter_token')) {
        localStorage.removeItem('globetrotter_token');
        localStorage.removeItem('globetrotter_user');
      }
    }
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// Auth Services
// -------------------------------------------------------------
export const authService = {
  async signup(data: { name: string; email: string; password: string; language?: string }) {
    const res = await api.post<{ access_token: string; token_type: string; user: User }>('/auth/signup', data);
    return res.data;
  },
  async login(data: { email: string; password: string }) {
    const res = await api.post<{ access_token: string; token_type: string; user: User }>('/auth/login', data);
    return res.data;
  },
  async getMe() {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
  async updateProfile(data: Partial<User>) {
    const res = await api.put<User>('/profile', data);
    return res.data;
  },
  async deleteAccount() {
    const res = await api.delete('/profile');
    return res.data;
  },
};

// -------------------------------------------------------------
// Trips Services
// -------------------------------------------------------------
export const tripService = {
  async getTrips() {
    const res = await api.get<Trip[]>('/trips');
    return res.data;
  },
  async getTrip(id: number) {
    const res = await api.get<Trip>(`/trips/${id}`);
    return res.data;
  },
  async createTrip(data: { name: string; description?: string; start_date: string; end_date: string; cover_image?: string }) {
    const res = await api.post<Trip>('/trips', data);
    return res.data;
  },
  async updateTrip(id: number, data: Partial<Trip>) {
    const res = await api.put<Trip>(`/trips/${id}`, data);
    return res.data;
  },
  async deleteTrip(id: number) {
    const res = await api.delete(`/trips/${id}`);
    return res.data;
  },
};

// -------------------------------------------------------------
// Trip Stops Services
// -------------------------------------------------------------
export const stopService = {
  async addStop(tripId: number, data: { city_id: number; start_date: string; end_date: string; order_index?: number }) {
    const res = await api.post<TripStop>(`/trips/${tripId}/stops`, data);
    return res.data;
  },
  async updateStop(id: number, data: { start_date?: string; end_date?: string; order_index?: number }) {
    const res = await api.put<TripStop>(`/stops/${id}`, data);
    return res.data;
  },
  async deleteStop(id: number) {
    const res = await api.delete(`/stops/${id}`);
    return res.data;
  },
  async reorderStops(tripId: number, stops: { id: number; order_index: number }[]) {
    const res = await api.put(`/trips/${tripId}/stops/reorder`, { stops });
    return res.data;
  },
};

// -------------------------------------------------------------
// Cities & Activities Services
// -------------------------------------------------------------
export const cityService = {
  async getCities(params?: { search?: string; country?: string; region?: string; min_cost?: number; max_cost?: number }) {
    const res = await api.get<City[]>('/cities', { params });
    return res.data;
  },
  async getCity(id: number) {
    const res = await api.get<City>(`/cities/${id}`);
    return res.data;
  },
  async getCityActivities(cityId: number, params?: { category?: string; max_cost?: number; max_duration?: number; search?: string }) {
    const res = await api.get<Activity[]>(`/cities/${cityId}/activities`, { params });
    return res.data;
  },
};

// -------------------------------------------------------------
// Itinerary Activities Services
// -------------------------------------------------------------
export const itineraryService = {
  async addActivity(stopId: number, data: { activity_id: number; activity_date: string; start_time?: string; order_index?: number; notes?: string }) {
    const res = await api.post<ItineraryActivity>(`/trip-stops/${stopId}/activities`, data);
    return res.data;
  },
  async updateActivity(id: number, data: { activity_date?: string; start_time?: string; order_index?: number; notes?: string }) {
    const res = await api.put<ItineraryActivity>(`/itinerary-activities/${id}`, data);
    return res.data;
  },
  async deleteActivity(id: number) {
    const res = await api.delete(`/itinerary-activities/${id}`);
    return res.data;
  },
};

// -------------------------------------------------------------
// Budget & Expense Services
// -------------------------------------------------------------
export const budgetService = {
  async getBudget(tripId: number, targetBudget?: number) {
    const res = await api.get<BudgetSummary>(`/trips/${tripId}/budget`, {
      params: targetBudget ? { target_budget: targetBudget } : undefined,
    });
    return res.data;
  },
  async addExpense(tripId: number, data: { category: string; amount: number; expense_date?: string; description?: string }) {
    const res = await api.post<Expense>(`/trips/${tripId}/expenses`, data);
    return res.data;
  },
  async updateExpense(id: number, data: Partial<Expense>) {
    const res = await api.put<Expense>(`/expenses/${id}`, data);
    return res.data;
  },
  async deleteExpense(id: number) {
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
  },
};

// -------------------------------------------------------------
// Sharing Services
// -------------------------------------------------------------
export const shareService = {
  async createShareLink(tripId: number) {
    const res = await api.post<SharedTripResponse>(`/trips/${tripId}/share`);
    return res.data;
  },
  async getPublicTrip(shareToken: string) {
    const res = await api.get<PublicTripView>(`/shared/${shareToken}`);
    return res.data;
  },
  async copyTrip(shareToken: string) {
    const res = await api.post<Trip>(`/shared/${shareToken}/copy`);
    return res.data;
  },
};

// -------------------------------------------------------------
// Admin & Analytics Services
// -------------------------------------------------------------
export const adminService = {
  async getAnalytics() {
    const res = await api.get<AnalyticsData>('/admin/analytics');
    return res.data;
  },
};
