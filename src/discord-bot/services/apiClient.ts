// src/discord-bot/services/apiClient.ts
import { Medication, ApiResponse } from '../../api/types';

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

  // Get all medications for a user
  async getUserMedications(userId: string): Promise<Medication[]> {
    return this.request<Medication[]>(`/medications/${userId}`);
  }

  // Get specific medication
  async getMedication(userId: string, medName: string): Promise<Medication> {
    return this.request<Medication>(`/medications/${userId}/${encodeURIComponent(medName)}`);
  }

  // Create new medication
  async createMedication(
    userId: string,
    name: string,
    time: string
  ): Promise<Medication> {
    return this.request<Medication>(`/medications/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ name, time }),
    });
  }

  // Update medication
  async updateMedication(
    userId: string,
    medName: string,
    updates: Partial<Medication>
  ): Promise<Medication> {
    return this.request<Medication>(
      `/medications/${userId}/${encodeURIComponent(medName)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );
  }

  // Delete medication
  async deleteMedication(userId: string, medName: string): Promise<void> {
    await this.request<void>(`/medications/${userId}/${encodeURIComponent(medName)}`, {
      method: 'DELETE',
    });
  }

  // Mark medication as taken
  async markMedicationTaken(userId: string, medName: string): Promise<void> {
    await this.request<void>(
      `/medications/${userId}/${encodeURIComponent(medName)}/taken`,
      {
        method: 'POST',
      }
    );
  }

  // Mark medication as not taken
  async markMedicationNotTaken(userId: string, medName: string): Promise<void> {
    await this.request<void>(
      `/medications/${userId}/${encodeURIComponent(medName)}/not-taken`,
      {
        method: 'POST',
      }
    );
  }

  // Get medications due now
  async getMedicationsDueNow(): Promise<{ userId: string; medication: Medication }[]> {
    return this.request<{ userId: string; medication: Medication }[]>('/medications/due');
  }

  // Reset daily medications
  async resetDailyMedications(): Promise<void> {
    await this.request<void>('/medications/reset-daily', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();