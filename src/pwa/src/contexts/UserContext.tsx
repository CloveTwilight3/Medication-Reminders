/** src/pwa/src/contexts/UserContext.tsx
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserContextType } from '../types';
import { api } from '../services/api';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [uid, setUid] = useState<string | null>(null);
  const [user, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has active session
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { uid: userId, user: userData } = await api.getCurrentUser();
      setUid(userId);
      setUserData(userData);
    } catch (error) {
      // No active session, user needs to login
      setUid(null);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = (userId: string, userData: User) => {
    setUid(userId);
    setUserData(userData);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUid(null);
      setUserData(null);
    }
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