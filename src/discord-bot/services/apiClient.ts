// src/discord-bot/services/apiClient.ts
import { Medication, ApiResponse, User } from '../../api/types';

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

  // Get or create user by Discord ID
  async getOrCreateUser(discordId: string): Promise<User> {
    try {
      // Try to get existing user
      const user = await this.request<User>(`/users/discord/${discordId}`);
      return user;
    } catch (error) {
      // User doesn't exist, create one
      return this.createUser(discordId);
    }
  }

  // Create new user with Discord ID
  async createUser(discordId: string): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify({
        createdVia: 'discord',
        discordId
      }),
    });
  }

  // Get user by Discord ID
  async getUserByDiscordId(discordId: string): Promise<User> {
    return this.request<User>(`/users/discord/${discordId}`);
  }

  // Get user by UID
  async getUser(uid: string): Promise<User> {
    return this.request<User>(`/users/${uid}`);
  }

  // Link Discord ID to existing UID (for /link command)
  async linkDiscordToUser(uid: string, discordId: string): Promise<User> {
    return this.request<User>(`/users/${uid}/link-discord`, {
      method: 'POST',
      body: JSON.stringify({ discordId }),
    });
  }

  // Validate link code from PWA
  async validateLinkCode(code: string): Promise<{ uid: string; user: User }> {
    return this.request<{ uid: string; user: User }>('/users/validate-link-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Generate connect token for /webconnect
  async generateConnectToken(uid: string): Promise<{ token: string }> {
    return this.request<{ token: string }>(`/users/${uid}/generate-connect-token`, {
      method: 'POST',
    });
  }

  // ========== MEDICATION MANAGEMENT ==========

  // Get all medications for a user (by UID)
  async getUserMedications(uid: string): Promise<Medication[]> {
    return this.request<Medication[]>(`/medications/${uid}`);
  }

  // Get specific medication
  async getMedication(uid: string, medName: string): Promise<Medication> {
    return this.request<Medication>(`/medications/${uid}/${encodeURIComponent(medName)}`);
  }

  // Create new medication
  async createMedication(
    uid: string,
    name: string,
    time: string
  ): Promise<Medication> {
    return this.request<Medication>(`/medications/${uid}`, {
      method: 'POST',
      body: JSON.stringify({ name, time }),
    });
  }

  // Update medication
  async updateMedication(
    uid: string,
    medName: string,
    updates: Partial<Medication>
  ): Promise<Medication> {
    return this.request<Medication>(
      `/medications/${uid}/${encodeURIComponent(medName)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );
  }

  // Delete medication
  async deleteMedication(uid: string, medName: string): Promise<void> {
    await this.request<void>(`/medications/${uid}/${encodeURIComponent(medName)}`, {
      method: 'DELETE',
    });
  }

  // Mark medication as taken
  async markMedicationTaken(uid: string, medName: string): Promise<void> {
    await this.request<void>(
      `/medications/${uid}/${encodeURIComponent(medName)}/taken`,
      {
        method: 'POST',
      }
    );
  }

  // Mark medication as not taken
  async markMedicationNotTaken(uid: string, medName: string): Promise<void> {
    await this.request<void>(
      `/medications/${uid}/${encodeURIComponent(medName)}/not-taken`,
      {
        method: 'POST',
      }
    );
  }

  // Get medications due now
  async getMedicationsDueNow(): Promise<{ uid: string; medication: Medication }[]> {
    return this.request<{ uid: string; medication: Medication }[]>('/medications/due');
  }

  // Reset daily medications
  async resetDailyMedications(): Promise<void> {
    await this.request<void>('/medications/reset-daily', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();