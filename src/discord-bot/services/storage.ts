// src/discord-bot/services/storage.ts
import { UserMedications, Medication } from '../types';
import * as fs from 'fs';
import * as path from 'path';

class MedicationStorage {
  private medications: UserMedications = {};
  private pendingReminders: Map<string, NodeJS.Timeout> = new Map();
  private dataPath: string;

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'medications.json');
    this.ensureDataDirectory();
    this.loadFromFile();
  }

  private ensureDataDirectory(): void {
    const dataDir = path.dirname(this.dataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private loadFromFile(): void {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = fs.readFileSync(this.dataPath, 'utf-8');
        this.medications = JSON.parse(data);
        console.log('✅ Loaded medications from file');
      } else {
        console.log('📝 No existing data file, starting fresh');
      }
    } catch (error) {
      console.error('❌ Error loading medications:', error);
      this.medications = {};
    }
  }

  private saveToFile(): void {
    try {
      fs.writeFileSync(
        this.dataPath,
        JSON.stringify(this.medications, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('❌ Error saving medications:', error);
    }
  }

  getUserMedications(userId: string): Medication[] {
    return this.medications[userId] || [];
  }

  addMedication(userId: string, medication: Medication): void {
    if (!this.medications[userId]) {
      this.medications[userId] = [];
    }
    this.medications[userId].push(medication);
    this.saveToFile();
  }

  removeMedication(userId: string, medName: string): boolean {
    const userMeds = this.medications[userId];
    if (!userMeds) return false;

    const index = userMeds.findIndex(m => m.name === medName);
    if (index === -1) return false;

    userMeds.splice(index, 1);
    this.saveToFile();
    return true;
  }

  markMedicationTaken(userId: string, medName: string): boolean {
    const userMeds = this.medications[userId];
    if (!userMeds) return false;

    const med = userMeds.find(m => m.name === medName);
    if (!med) return false;

    med.taken = true;
    this.saveToFile();
    return true;
  }

  getAllUserMedications(): UserMedications {
    return this.medications;
  }

  resetDailyMedications(): void {
    for (const medications of Object.values(this.medications)) {
      for (const med of medications) {
        med.taken = false;
        med.reminderSent = false;
      }
    }
    this.saveToFile();
  }

  setPendingReminder(reminderId: string, timeout: NodeJS.Timeout): void {
    this.pendingReminders.set(reminderId, timeout);
  }

  cancelPendingReminder(reminderId: string): boolean {
    const timeout = this.pendingReminders.get(reminderId);
    if (timeout) {
      clearTimeout(timeout);
      this.pendingReminders.delete(reminderId);
      return true;
    }
    return false;
  }
}

export const storage = new MedicationStorage();