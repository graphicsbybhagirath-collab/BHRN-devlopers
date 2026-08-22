import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';
import { useToast } from './ToastContext';
import { getErrorMessage } from '../utils/errors';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, language?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('globetrotter_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('globetrotter_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('globetrotter_token');
      if (storedToken) {
        try {
          const freshUser = await authService.getMe();
          setUser(freshUser);
          localStorage.setItem('globetrotter_user', JSON.stringify(freshUser));
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authService.login({ email, password });
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem('globetrotter_token', res.access_token);
      localStorage.setItem('globetrotter_user', JSON.stringify(res.user));
      toast.success(`Welcome back, ${res.user.name}!`, 'Ready to plan your next journey.');
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Invalid email or password. Please try again.');
      toast.error('Login Failed', msg);
      throw new Error(msg);
    }
  };

  const signup = async (name: string, email: string, password: string, language: string = 'English') => {
    try {
      const res = await authService.signup({ name, email, password, language });
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem('globetrotter_token', res.access_token);
      localStorage.setItem('globetrotter_user', JSON.stringify(res.user));
      toast.success(`Welcome to GlobeTrotter, ${res.user.name}!`, 'Your account has been created.');
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to create account.');
      toast.error('Signup Failed', msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('globetrotter_token');
    localStorage.removeItem('globetrotter_user');
    toast.info('Logged Out', 'You have been signed out safely.');
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updated = await authService.updateProfile(userData);
      setUser(updated);
      localStorage.setItem('globetrotter_user', JSON.stringify(updated));
      toast.success('Profile Updated', 'Your changes have been saved.');
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to update profile.');
      toast.error('Update Failed', msg);
      throw new Error(msg);
    }
  };

  const deleteAccount = async () => {
    try {
      await authService.deleteAccount();
      logout();
      toast.info('Account Deleted', 'Your profile and data have been removed.');
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to delete account.');
      toast.error('Action Failed', msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};