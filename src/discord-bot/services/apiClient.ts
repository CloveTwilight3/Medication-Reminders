// src/discord-bot/services/apiClient.ts
import { Medication, ApiResponse, User, CreateMedicationRequest, UpdateMedicationRequest } from '../../api/types';

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.API_URL || 'http://localhost:3000/api';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json() as ApiResponse<T>;

      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      return data.data as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ========== USER MANAGEMENT ==========

  async getOrCreateUser(discordId: string): Promise<User> {
    try {
      const user = await this.request<User>(`/users/discord/${discordId}`);
      return user;
    } catch (error) {
      return this.createUser(discordId);
    }
  }

  async createUser(discordId: string, timezone?: string): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify({
        createdVia: 'discord',
        discordId,
        timezone
      }),
    });
  }

  async getUserByDiscordId(discordId: string): Promise<User> {
    return this.request<User>(`/users/discord/${discordId}`);
  }

  async getUser(uid: string): Promise<User> {
    return this.request<User>(`/users/${uid}`);
  }

  async updateUserTimezone(uid: string, timezone: string): Promise<User> {
    return this.request<User>(`/users/${uid}/settings`, {
      method: 'PATCH',
      body: JSON.stringify({ timezone }),
    });
  }

  async linkDiscordToUser(uid: string, discordId: string): Promise<User> {
    return this.request<User>(`/users/${uid}/link-discord`, {
      method: 'POST',
      body: JSON.stringify({ discordId }),
    });
  }

  // ========== MEDICATION MANAGEMENT ==========

  async getUserMedications(uid: string): Promise<Medication[]> {
    return this.request<Medication[]>(`/medications/${uid}`);
  }

  async getMedication(uid: string, medName: string): Promise<Medication> {
    return this.request<Medication>(`/medications/${uid}/${encodeURIComponent(medName)}`);
  }

  async createMedication(
    uid: string,
    medication: Omit<CreateMedicationRequest, 'uid'>
  ): Promise<Medication> {
    return this.request<Medication>(`/medications/${uid}`, {
      method: 'POST',
      body: JSON.stringify(medication),
    });
  }

  async updateMedication(
    uid: string,
    medName: string,
    updates: UpdateMedicationRequest
  ): Promise<Medication> {
    return this.request<Medication>(
      `/medications/${uid}/${encodeURIComponent(medName)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );
  }

  async deleteMedication(uid: string, medName: string): Promise<void> {
    await this.request<void>(`/medications/${uid}/${encodeURIComponent(medName)}`, {
      method: 'DELETE',
    });
  }

  async markMedicationTaken(uid: string, medName: string): Promise<void> {
    await this.request<void>(
      `/medications/${uid}/${encodeURIComponent(medName)}/taken`,
      {
        method: 'POST',
      }
    );
  }

  async markMedicationNotTaken(uid: string, medName: string): Promise<void> {
    await this.request<void>(
      `/medications/${uid}/${encodeURIComponent(medName)}/not-taken`,
      {
        method: 'POST',
      }
    );
  }

  async getMedicationsDueNow(): Promise<{ uid: string; medication: Medication; userTimezone: string }[]> {
    return this.request<{ uid: string; medication: Medication; userTimezone: string }[]>('/medications/due');
  }

  async resetDailyMedications(): Promise<void> {
    await this.request<void>('/medications/reset-daily', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();