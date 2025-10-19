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
    const { uid, name, time } = request;

    if (!name || !time) {
      throw new Error('Name and time are required');
    }

    if (!this.validateTime(time)) {
      throw new Error('Invalid time format. Use HH:MM (e.g., 09:00)');
    }

    return this.storage.addMedication(uid, { name, time });
  }

  async getUserMedications(uid: string): Promise<Medication[]> {
    return this.storage.getUserMedications(uid);
  }

  async getMedication(uid: string, medName: string): Promise<Medication | null> {
    return this.storage.getMedication(uid, medName);
  }

  async updateMedication(
    uid: string,
    medName: string,
    updates: UpdateMedicationRequest
  ): Promise<Medication | null> {
    const medication = this.storage.updateMedication(uid, medName, updates);
    if (!medication) {
      throw new Error('Medication not found');
    }
    return medication;
  }

  async deleteMedication(uid: string, medName: string): Promise<boolean> {
    const success = this.storage.removeMedication(uid, medName);
    if (!success) {
      throw new Error('Medication not found');
    }
    return true;
  }

  async markTaken(uid: string, medName: string): Promise<boolean> {
    const success = this.storage.markMedicationTaken(uid, medName, true);
    if (!success) {
      throw new Error('Medication not found');
    }
    return true;
  }

  async markNotTaken(uid: string, medName: string): Promise<boolean> {
    const success = this.storage.markMedicationTaken(uid, medName, false);
    if (!success) {
      throw new Error('Medication not found');
    }
    return true;
  }

  async getMedicationsDueNow(): Promise<{ uid: string; medication: Medication }[]> {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const allMedications = this.storage.getAllUserMedications();
    const dueNow: { uid: string; medication: Medication }[] = [];

    for (const userMeds of allMedications) {
      for (const med of userMeds.medications) {
        if (med.time === currentTime && !med.taken && !med.reminderSent) {
          dueNow.push({ uid: userMeds.uid, medication: med });
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