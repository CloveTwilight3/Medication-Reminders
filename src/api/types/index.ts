// src/api/types/index.ts

export type FrequencyType = 'daily' | 'every-2-days' | 'weekly' | 'bi-weekly' | 'monthly';

export interface Medication {
  name: string;
  time: string; // Format "HH:MM" in UTC
  frequency: FrequencyType;
  
  // Optional fields
  dose?: string; // e.g., "10mg", "2 tablets"
  amount?: string; // e.g., "1 pill", "5ml"
  instructions?: string; // e.g., "Take with food"
  
  // Tracking
  taken: boolean;
  reminderSent: boolean;
  lastTaken?: Date; // Track when it was last taken for non-daily meds
  nextDue?: Date; // When the next dose is due
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  uid: string;
  discordId: string | null;
  timezone: string; // IANA timezone string (e.g., "America/New_York", "Europe/London")
  createdAt: Date;
  createdVia: 'discord' | 'pwa';
}

export interface SessionToken {
  uid: string;
  expiresAt: Date;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface UserMedications {
  [uid: string]: Medication[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateMedicationRequest {
  uid: string;
  name: string;
  time: string;
  frequency: FrequencyType;
  dose?: string;
  amount?: string;
  instructions?: string;
}

export interface UpdateMedicationRequest {
  time?: string;
  frequency?: FrequencyType;
  dose?: string;
  amount?: string;
  instructions?: string;
  taken?: boolean;
  reminderSent?: boolean;
  lastTaken?: Date;
  nextDue?: Date;
}

export interface MedicationQuery {
  uid: string;
  date?: string;
  taken?: boolean;
}

export interface CreateUserRequest {
  createdVia: 'discord' | 'pwa';
  discordId?: string;
  timezone?: string; // Optional, will auto-detect if not provided
}

export interface LinkDiscordRequest {
  discordId: string;
}

export interface UpdateUserRequest {
  timezone?: string;
}