// src/pwa/src/types/index.ts

export interface User {
  uid: string;
  discordId: string | null;
  createdAt: Date;
  createdVia: 'discord' | 'pwa';
}

export interface Medication {
  name: string;
  time: string;
  taken: boolean;
  reminderSent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserContextType {
  uid: string | null;
  user: User | null;
  setUser: (uid: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}