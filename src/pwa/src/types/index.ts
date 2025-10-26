/** src/pwa/src/types/index.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

export type FrequencyType = 'daily' | 'every-2-days' | 'weekly' | 'bi-weekly' | 'monthly' | 'custom';

export interface User {
  uid: string;
  discordId: string | null;
  timezone: string;
  createdAt: Date;
  createdVia: 'discord' | 'pwa';
}

export interface Medication {
  name: string;
  time: string;
  frequency: FrequencyType;
  customDays?: number; // For 'custom' frequency: number of days between doses
  dose?: string;
  amount?: string;
  instructions?: string;
  taken: boolean;
  reminderSent: boolean;
  lastTaken?: Date;
  nextDue?: Date;
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

export const FREQUENCY_OPTIONS: { value: FrequencyType; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'every-2-days', label: 'Every 2 Days' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly (Every 2 Weeks)' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom (Specify Days)' }
];

export const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'British Time (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Europe/Athens', label: 'Eastern European Time (EET)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time (NZST)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' }
];