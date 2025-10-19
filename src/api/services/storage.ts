// src/api/services/storage.ts
import { Medication } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class StorageService {
  private medicationsDir: string;

  constructor(dataPath?: string) {
    const baseDir = dataPath || path.join(process.cwd(), 'data');
    this.medicationsDir = path.join(baseDir, 'medications');
    this.ensureMedicationsDirectory();
  }

  private ensureMedicationsDirectory(): void {
    if (!fs.existsSync(this.medicationsDir)) {
      fs.mkdirSync(this.medicationsDir, { recursive: true });
      console.log('✅ Created medications directory');
    }
  }

  private getUserFilePath(uid: string): string {
    return path.join(this.medicationsDir, `${uid}.json`);
  }

  private loadUserMedications(uid: string): Medication[] {
    const filePath = this.getUserFilePath(uid);
    
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error(`❌ Error loading medications for ${uid}:`, error);
      return [];
    }
  }

  private saveUserMedications(uid: string, medications: Medication[]): void {
    const filePath = this.getUserFilePath(uid);
    
    try {
      fs.writeFileSync(
        filePath,
        JSON.stringify(medications, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error(`❌ Error saving medications for ${uid}:`, error);
      throw new Error('Failed to save medications');
    }
  }

  getUserMedications(uid: string): Medication[] {
    return this.loadUserMedications(uid);
  }

  getMedication(uid: string, medName: string): Medication | null {
    const userMeds = this.loadUserMedications(uid);
    return userMeds.find(m => m.name === medName) || null;
  }

  addMedication(uid: string, medication: Omit<Medication, 'taken' | 'reminderSent'>): Medication {
    const userMeds = this.loadUserMedications(uid);

    // Check for duplicates
    const exists = userMeds.some(m => m.name === medication.name);
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

    userMeds.push(newMed);
    this.saveUserMedications(uid, userMeds);
    return newMed;
  }

  updateMedication(uid: string, medName: string, updates: Partial<Medication>): Medication | null {
    const userMeds = this.loadUserMedications(uid);
    const med = userMeds.find(m => m.name === medName);
    
    if (!med) return null;

    Object.assign(med, { ...updates, updatedAt: new Date() });
    this.saveUserMedications(uid, userMeds);
    return med;
  }

  removeMedication(uid: string, medName: string): boolean {
    const userMeds = this.loadUserMedications(uid);
    const index = userMeds.findIndex(m => m.name === medName);
    
    if (index === -1) return false;

    userMeds.splice(index, 1);
    this.saveUserMedications(uid, userMeds);
    return true;
  }

  markMedicationTaken(uid: string, medName: string, taken: boolean = true): boolean {
    const userMeds = this.loadUserMedications(uid);
    const med = userMeds.find(m => m.name === medName);
    
    if (!med) return false;

    med.taken = taken;
    med.updatedAt = new Date();
    this.saveUserMedications(uid, userMeds);
    return true;
  }

  getAllUserMedications(): { uid: string; medications: Medication[] }[] {
    const result: { uid: string; medications: Medication[] }[] = [];

    try {
      const files = fs.readdirSync(this.medicationsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const uid = file.replace('.json', '');
          const medications = this.loadUserMedications(uid);
          result.push({ uid, medications });
        }
      }
    } catch (error) {
      console.error('❌ Error reading medications directory:', error);
    }

    return result;
  }

  resetDailyMedications(): void {
    const allUsers = this.getAllUserMedications();

    for (const { uid, medications } of allUsers) {
      for (const med of medications) {
        med.taken = false;
        med.reminderSent = false;
        med.updatedAt = new Date();
      }
      this.saveUserMedications(uid, medications);
    }

    console.log('✅ Daily medication status reset for all users');
  }

  getAllUsers(): string[] {
    try {
      const files = fs.readdirSync(this.medicationsDir);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch (error) {
      console.error('❌ Error reading medications directory:', error);
      return [];
    }
  }

  deleteUserMedications(uid: string): boolean {
    const filePath = this.getUserFilePath(uid);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`❌ Error deleting medications for ${uid}:`, error);
      return false;
    }
  }
}

// Singleton instance
export const storageService = new StorageService();