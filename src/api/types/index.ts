// src/api/types/index.ts

export interface Medication {
  name: string;
  time: string; // Format "HH:MM"
  taken: boolean;
  reminderSent: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserMedications {
  [userId: string]: Medication[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateMedicationRequest {
  userId: string;
  name: string;
  time: string;
}

export interface UpdateMedicationRequest {
  taken?: boolean;
  reminderSent?: boolean;
}

export interface MedicationQuery {
  userId: string;
  date?: string;
  taken?: boolean;
}