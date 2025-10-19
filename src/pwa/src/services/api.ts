// src/pwa/src/services/api.ts
import { User, Medication, ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
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

  // ========== USER MANAGEMENT ==========

  async createUser(): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify({
        createdVia: 'pwa'
      }),
    });
  }

  async getUser(uid: string): Promise<User> {
    return this.request<User>(`/users/${uid}`);
  }

  async getUserByDiscordId(discordId: string): Promise<User> {
    return this.request<User>(`/users/discord/${discordId}`);
  }

  async generateLinkCode(uid: string): Promise<{ code: string }> {
    return this.request<{ code: string }>(`/users/${uid}/generate-link-code`, {
      method: 'POST',
    });
  }

  async validateConnectToken(token: string): Promise<{ uid: string; user: User }> {
    return this.request<{ uid: string; user: User }>('/users/validate-connect-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // ========== MEDICATION MANAGEMENT ==========

  async getMedications(uid: string): Promise<Medication[]> {
    return this.request<Medication[]>(`/medications/${uid}`);
  }

  async getMedication(uid: string, medName: string): Promise<Medication> {
    return this.request<Medication>(`/medications/${uid}/${encodeURIComponent(medName)}`);
  }

  async createMedication(uid: string, name: string, time: string): Promise<Medication> {
    return this.request<Medication>(`/medications/${uid}`, {
      method: 'POST',
      body: JSON.stringify({ name, time }),
    });
  }

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