// src/api/services/storage.ts
import { UserMedications, Medication } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class StorageService {
  private medications: UserMedications = {};
  private dataPath: string;

  constructor(dataPath?: string) {
    this.dataPath = dataPath || path.join(process.cwd(), 'data', 'medications.json');
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
      throw new Error('Failed to save medications');
    }
  }

  getUserMedications(userId: string): Medication[] {
    return this.medications[userId] || [];
  }

  getMedication(userId: string, medName: string): Medication | null {
    const userMeds = this.medications[userId];
    if (!userMeds) return null;
    return userMeds.find(m => m.name === medName) || null;
  }

  addMedication(userId: string, medication: Omit<Medication, 'taken' | 'reminderSent'>): Medication {
    if (!this.medications[userId]) {
      this.medications[userId] = [];
    }

    // Check for duplicates
    const exists = this.medications[userId].some(m => m.name === medication.name);
    if (exists) {
      throw new Error(`Medication "${medication.name}" already exists for this user`);
    }

    const newMed: Medication = {
      ...medication,
      taken: false,
      reminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.medications[userId].push(newMed);
    this.saveToFile();
    return newMed;
  }

  updateMedication(userId: string, medName: string, updates: Partial<Medication>): Medication | null {
    const userMeds = this.medications[userId];
    if (!userMeds) return null;

    const med = userMeds.find(m => m.name === medName);
    if (!med) return null;

    Object.assign(med, { ...updates, updatedAt: new Date() });
    this.saveToFile();
    return med;
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

  markMedicationTaken(userId: string, medName: string, taken: boolean = true): boolean {
    const userMeds = this.medications[userId];
    if (!userMeds) return false;

    const med = userMeds.find(m => m.name === medName);
    if (!med) return false;

    med.taken = taken;
    med.updatedAt = new Date();
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
        med.updatedAt = new Date();
      }
    }
    this.saveToFile();
    console.log('✅ Daily medication status reset');
  }

  getAllUsers(): string[] {
    return Object.keys(this.medications);
  }

  deleteUser(userId: string): boolean {
    if (!this.medications[userId]) return false;
    delete this.medications[userId];
    this.saveToFile();
    return true;
  }
}

// Singleton instance
export const storageService = new StorageService();