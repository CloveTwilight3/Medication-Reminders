// src/api/types/index.ts

export interface Medication {
  name: string;
  time: string; // Format "HH:MM"
  taken: boolean;
  reminderSent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  uid: string;
  discordId: string | null;
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
}

export interface UpdateMedicationRequest {
  taken?: boolean;
  reminderSent?: boolean;
}

export interface MedicationQuery {
  uid: string;
  date?: string;
  taken?: boolean;
}

export interface CreateUserRequest {
  createdVia: 'discord' | 'pwa';
  discordId?: string;
}

export interface LinkDiscordRequest {
  discordId: string;
}