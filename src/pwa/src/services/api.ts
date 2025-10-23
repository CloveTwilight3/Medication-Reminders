// src/pwa/src/services/api.ts
import { User, Medication, ApiResponse, FrequencyType } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data: ApiResponse<T> = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Request failed');
    }

    return data.data as T;
  }

  // ========== AUTH ==========

  async getDiscordAuthUrl(): Promise<{ url: string }> {
    // The /auth/discord endpoint returns a Discord OAuth URL
    // Timezone will default to UTC and can be changed in settings
    return this.request<{ url: string }>('/auth/discord');
  }

  async getCurrentUser(): Promise<{ uid: string; user: User }> {
    return this.request<{ uid: string; user: User }>('/auth/me');
  }

  async logout(): Promise<void> {
    await this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async updateSettings(timezone: string): Promise<User> {
    return this.request<User>('/auth/settings', {
      method: 'PATCH',
      body: JSON.stringify({ timezone }),
    });
  }

  // ========== MEDICATION MANAGEMENT ==========

  async getMedications(uid: string): Promise<Medication[]> {
    return this.request<Medication[]>(`/medications/${uid}`);
  }

  async getMedication(uid: string, medName: string): Promise<Medication> {
    return this.request<Medication>(`/medications/${uid}/${encodeURIComponent(medName)}`);
  }

  async createMedication(
    uid: string,
    medication: {
      name: string;
      time: string;
      frequency: FrequencyType;
      dose?: string;
      amount?: string;
      instructions?: string;
    }
  ): Promise<Medication> {
    return this.request<Medication>(`/medications/${uid}`, {
      method: 'POST',
      body: JSON.stringify(medication),
    });
  }

  async updateMedication(
    uid: string,
    medName: string,
    updates: {
      time?: string;
      frequency?: FrequencyType;
      dose?: string;
      amount?: string;
      instructions?: string;
    }
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
}

export const api = new ApiClient();