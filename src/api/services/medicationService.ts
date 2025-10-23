/** src/api/services/medicationService.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import { storageService } from './storage';
import { userService } from './userService';
import { websocketService } from './websocketService';
import { Medication, CreateMedicationRequest, UpdateMedicationRequest, FrequencyType } from '../types';

export class MedicationService {
  private storage = storageService;

  validateTime(time: string): boolean {
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return false;
    }

    const [hours, minutes] = time.split(':').map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  }

  validateFrequency(frequency: string): frequency is FrequencyType {
    return ['daily', 'every-2-days', 'weekly', 'bi-weekly', 'monthly'].includes(frequency);
  }

  // Calculate next due date based on frequency
  calculateNextDue(lastTaken: Date, frequency: FrequencyType): Date {
    const next = new Date(lastTaken);
    
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'every-2-days':
        next.setDate(next.getDate() + 2);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'bi-weekly':
        next.setDate(next.getDate() + 14);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
    }
    
    return next;
  }

  // Check if medication is due based on frequency and last taken
  isMedicationDue(med: Medication, userTimezone: string): boolean {
    const now = new Date();
    
    // For daily medications, check if already taken today
    if (med.frequency === 'daily') {
      return !med.taken;
    }
    
    // For non-daily medications, check nextDue date
    if (med.nextDue) {
      return now >= new Date(med.nextDue) && !med.taken;
    }
    
    // If no nextDue is set, it's due (first time)
    return !med.taken;
  }

  async createMedication(request: CreateMedicationRequest): Promise<Medication> {
    const { uid, name, time, frequency, dose, amount, instructions } = request;

    if (!name || !time || !frequency) {
      throw new Error('Name, time, and frequency are required');
    }

    if (!this.validateTime(time)) {
      throw new Error('Invalid time format. Use HH:MM (e.g., 09:00)');
    }

    if (!this.validateFrequency(frequency)) {
      throw new Error('Invalid frequency. Must be: daily, every-2-days, weekly, bi-weekly, or monthly');
    }

    // Calculate initial nextDue for non-daily meds
    let nextDue: Date | undefined;
    if (frequency !== 'daily') {
      nextDue = new Date();
      // Set to today at the specified time
      const [hours, minutes] = time.split(':').map(Number);
      nextDue.setHours(hours, minutes, 0, 0);
    }

    const medication = this.storage.addMedication(uid, {
      name,
      time,
      frequency,
      dose,
      amount,
      instructions,
      nextDue
    });

    // Send WebSocket notification
    websocketService.notifyUser(uid, {
      type: 'medication_added',
      uid,
      data: medication
    });

    return medication;
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
    // Validate time if provided
    if (updates.time && !this.validateTime(updates.time)) {
      throw new Error('Invalid time format. Use HH:MM (e.g., 09:00)');
    }

    // Validate frequency if provided
    if (updates.frequency && !this.validateFrequency(updates.frequency)) {
      throw new Error('Invalid frequency');
    }

    const medication = this.storage.updateMedication(uid, medName, updates);
    if (!medication) {
      throw new Error('Medication not found');
    }

    // Send WebSocket notification
    websocketService.notifyUser(uid, {
      type: 'medication_updated',
      uid,
      data: medication
    });

    return medication;
  }

  async deleteMedication(uid: string, medName: string): Promise<boolean> {
    const success = this.storage.removeMedication(uid, medName);
    if (!success) {
      throw new Error('Medication not found');
    }

    // Send WebSocket notification
    websocketService.notifyUser(uid, {
      type: 'medication_deleted',
      uid,
      data: { name: medName }
    });

    return true;
  }

  async markTaken(uid: string, medName: string): Promise<boolean> {
    const med = this.storage.getMedication(uid, medName);
    if (!med) {
      throw new Error('Medication not found');
    }

    const now = new Date();
    const updates: UpdateMedicationRequest = {
      taken: true,
      lastTaken: now
    };

    // Calculate nextDue for non-daily medications
    if (med.frequency !== 'daily') {
      updates.nextDue = this.calculateNextDue(now, med.frequency);
    }

    const updatedMed = this.storage.updateMedication(uid, medName, updates);
    if (!updatedMed) {
      throw new Error('Failed to update medication');
    }

    // Send WebSocket notification
    websocketService.notifyUser(uid, {
      type: 'medication_updated',
      uid,
      data: updatedMed
    });

    return true;
  }

  async markNotTaken(uid: string, medName: string): Promise<boolean> {
    const updatedMed = this.storage.updateMedication(uid, medName, { taken: false });
    if (!updatedMed) {
      throw new Error('Medication not found');
    }

    // Send WebSocket notification
    websocketService.notifyUser(uid, {
      type: 'medication_updated',
      uid,
      data: updatedMed
    });

    return true;
  }

  async getMedicationsDueNow(): Promise<{ uid: string; medication: Medication; userTimezone: string }[]> {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    
    const allMedications = this.storage.getAllUserMedications();
    const dueNow: { uid: string; medication: Medication; userTimezone: string }[] = [];

    for (const userMeds of allMedications) {
      // Get user timezone
      const user = userService.getUser(userMeds.uid);
      if (!user) continue;

      for (const med of userMeds.medications) {
        // Convert med time from user's timezone to UTC
        const [medHour, medMinute] = med.time.split(':').map(Number);
        
        // Create a date in user's timezone
        const userDate = new Date(now.toLocaleString('en-US', { timeZone: user.timezone }));
        userDate.setHours(medHour, medMinute, 0, 0);
        
        // Convert to UTC for comparison
        const utcHour = userDate.getUTCHours();
        const utcMinute = userDate.getUTCMinutes();
        
        // Check if it's time for this medication
        const isTimeMatch = utcHour === currentHour && utcMinute === currentMinute;
        const isDue = this.isMedicationDue(med, user.timezone);
        
        if (isTimeMatch && isDue && !med.reminderSent) {
          dueNow.push({ uid: userMeds.uid, medication: med, userTimezone: user.timezone });
        }
      }
    }

    return dueNow;
  }

  async resetDaily(): Promise<void> {
    const allUsers = this.storage.getAllUserMedications();

    for (const { uid, medications } of allUsers) {
      for (const med of medications) {
        // Only reset daily medications
        if (med.frequency === 'daily') {
          med.taken = false;
          med.reminderSent = false;
          med.updatedAt = new Date();
        } else {
          // For non-daily meds, just reset reminderSent
          med.reminderSent = false;
          med.updatedAt = new Date();
        }
      }
      this.storage.saveUserMedications(uid, medications);

      // Send WebSocket notification for each user
      websocketService.notifyUser(uid, {
        type: 'medication_updated',
        uid,
        data: { message: 'Daily reset completed' }
      });
    }

    console.log('✅ Daily medication status reset for all users');
  }

  async getAllUsers(): Promise<string[]> {
    return this.storage.getAllUsers();
  }
}

export const medicationService = new MedicationService();