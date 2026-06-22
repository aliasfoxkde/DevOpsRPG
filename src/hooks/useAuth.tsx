'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, CareerPath } from '@/types';
import { storage, generateId } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (provider: 'google' | 'github') => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user for development
const createDemoUser = (): User => ({
  id: 'demo-user-001',
  email: 'demo@devopsquest.dev',
  name: 'Demo Learner',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  provider: 'google',
  providerId: 'demo-google-001',
  xp: 1250,
  level: 4,
  streakDays: 5,
  lastActive: new Date().toISOString(),
  theme: 'web-developer',
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      // For demo, auto-login with demo user
      // In production, this would check for a valid session token
      const storedUser = storage.get<User | null>('user', null);

      if (storedUser) {
        setUser(storedUser);
      } else {
        // Auto-create demo user for now
        const demoUser = createDemoUser();
        storage.set('user', demoUser);
        setUser(demoUser);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback((provider: 'google' | 'github') => {
    // In production, this would redirect to OAuth
    // For demo, create a user
    const demoUser = createDemoUser();
    demoUser.provider = provider;
    storage.set('user', demoUser);
    setUser(demoUser);
  }, []);

  const logout = useCallback(() => {
    storage.remove('user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      storage.set('user', updated);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
