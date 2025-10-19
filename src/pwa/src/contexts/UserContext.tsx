// src/pwa/src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserContextType } from '../types';
import { api } from '../services/api';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [uid, setUid] = useState<string | null>(null);
  const [user, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load UID from localStorage on mount
    const storedUid = localStorage.getItem('uid');
    if (storedUid) {
      loadUser(storedUid);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUser = async (userId: string) => {
    try {
      const userData = await api.getUser(userId);
      setUid(userId);
      setUserData(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      // Clear invalid UID
      localStorage.removeItem('uid');
      setUid(null);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = (userId: string, userData: User) => {
    localStorage.setItem('uid', userId);
    setUid(userId);
    setUserData(userData);
  };

  const logout = () => {
    localStorage.removeItem('uid');
    setUid(null);
    setUserData(null);
  };

  return (
    <UserContext.Provider value={{ uid, user, setUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}