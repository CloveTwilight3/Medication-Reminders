// src/api/services/medicationService.ts
import { storageService } from './storage';
import { Medication, CreateMedicationRequest, UpdateMedicationRequest } from '../types';

export class MedicationService {
  private storage = storageService;

  validateTime(time: string): boolean {
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return false;
    }

    const [hours, minutes] = time.split(':').map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  }

  async createMedication(request: CreateMedicationRequest): Promise<Medication> {
    const { userId, name, time } = request;

    if (!name || !time) {
      throw new Error('Name and time are required');
    }

    if (!this.validateTime(time)) {
      throw new Error('Invalid time format. Use HH:MM (e.g., 09:00)');
    }

    return this.storage.addMedication(userId, { name, time });
  }

  async getUserMedications(userId: string): Promise<Medication[]> {
    return this.storage.getUserMedications(userId);
  }

  async getMedication(userId: string, medName: string): Promise<Medication | null> {
    return this.storage.getMedication(userId, medName);
  }

  async updateMedication(
    userId: string,
    medName: string,
    updates: UpdateMedicationRequest
  ): Promise<Medication | null> {
    const medication = this.storage.updateMedication(userId, medName, updates);
    if (!medication) {
      throw new Error('Medication not found');
    }
    return medication;
  }

  async deleteMedication(userId: string, medName: string): Promise<boolean> {
    const success = this.storage.removeMedication(userId, medName);
    if (!success) {
      throw new Error('Medication not found');
    }
    return true;
  }

  async markTaken(userId: string, medName: string): Promise<boolean> {
    const success = this.storage.markMedicationTaken(userId, medName, true);
    if (!success) {
      throw new Error('Medication not found');
    }
    return true;
  }

  async markNotTaken(userId: string, medName: string): Promise<boolean> {
    const success = this.storage.markMedicationTaken(userId, medName, false);
    if (!success) {
      throw new Error('Medication not found');
    }
    return true;
  }

  async getMedicationsDueNow(): Promise<{ userId: string; medication: Medication }[]> {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const allMedications = this.storage.getAllUserMedications();
    const dueNow: { userId: string; medication: Medication }[] = [];

    for (const [userId, medications] of Object.entries(allMedications)) {
      for (const med of medications) {
        if (med.time === currentTime && !med.taken && !med.reminderSent) {
          dueNow.push({ userId, medication: med });
        }
      }
    }

    return dueNow;
  }

  async resetDaily(): Promise<void> {
    this.storage.resetDailyMedications();
  }

  async getAllUsers(): Promise<string[]> {
    return this.storage.getAllUsers();
  }
}

export const medicationService = new MedicationService();