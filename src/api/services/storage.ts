/** src/api/services/storage.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import Database from 'better-sqlite3';
import { Medication } from '../types';
import * as fs from 'fs';
import * as path from 'path';

interface DbMedication {
  id: number;
  uid: string;
  name: string;
  time: string;
  frequency: string;
  custom_days: number | null;
  dose: string | null;
  amount: string | null;
  instructions: string | null;
  taken: number; // SQLite uses 0/1 for boolean
  reminder_sent: number;
  last_taken: string | null; // ISO string
  next_due: string | null; // ISO string
  created_at: string;
  updated_at: string;
}

export class StorageService {
  private db: Database.Database;

  constructor(dataPath?: string) {
    const baseDir = dataPath || path.join(process.cwd(), 'data');
    
    // Ensure data directory exists
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const dbPath = path.join(baseDir, 'medications.db');
    this.db = new Database(dbPath);
    
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
    
    // Initialize database schema
    this.initializeSchema();
    
    console.log('✅ SQLite database initialized');
  }

  private initializeSchema(): void {
    const schemaPath = path.join(__dirname, '../../schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      this.db.exec(schema);
    } else {
      // Inline schema if file doesn't exist
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          uid VARCHAR(255) PRIMARY KEY,
          discord_id VARCHAR(255) UNIQUE,
          timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_via VARCHAR(20) NOT NULL CHECK (created_via IN ('discord', 'pwa')),
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);

        CREATE TABLE IF NOT EXISTS sessions (
          token VARCHAR(255) PRIMARY KEY,
          uid VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_sessions_uid ON sessions(uid);
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

        CREATE TABLE IF NOT EXISTS medications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uid VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          time VARCHAR(5) NOT NULL,
          frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'every-2-days', 'weekly', 'bi-weekly', 'monthly', 'custom')),
          custom_days INTEGER,
          dose VARCHAR(255),
          amount VARCHAR(255),
          instructions TEXT,
          taken BOOLEAN NOT NULL DEFAULT 0,
          reminder_sent BOOLEAN NOT NULL DEFAULT 0,
          last_taken TIMESTAMP,
          next_due TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE,
          UNIQUE(uid, name),
          CHECK (frequency != 'custom' OR custom_days IS NOT NULL),
          CHECK (custom_days IS NULL OR (custom_days >= 1 AND custom_days <= 365))
        );

        CREATE INDEX IF NOT EXISTS idx_medications_uid ON medications(uid);
        CREATE INDEX IF NOT EXISTS idx_medications_uid_name ON medications(uid, name);
      `);
    }
  }

  private dbToMedication(row: DbMedication): Medication {
    return {
      name: row.name,
      time: row.time,
      frequency: row.frequency as any,
      customDays: row.custom_days || undefined,
      dose: row.dose || undefined,
      amount: row.amount || undefined,
      instructions: row.instructions || undefined,
      taken: row.taken === 1,
      reminderSent: row.reminder_sent === 1,
      lastTaken: row.last_taken ? new Date(row.last_taken) : undefined,
      nextDue: row.next_due ? new Date(row.next_due) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  getUserMedications(uid: string): Medication[] {
    const stmt = this.db.prepare(`
      SELECT * FROM medications 
      WHERE uid = ? 
      ORDER BY time ASC
    `);
    
    const rows = stmt.all(uid) as DbMedication[];
    return rows.map(row => this.dbToMedication(row));
  }

  getMedication(uid: string, medName: string): Medication | null {
    const stmt = this.db.prepare(`
      SELECT * FROM medications 
      WHERE uid = ? AND name = ?
    `);
    
    const row = stmt.get(uid, medName) as DbMedication | undefined;
    return row ? this.dbToMedication(row) : null;
  }

  addMedication(
    uid: string, 
    medication: Omit<Medication, 'taken' | 'reminderSent' | 'createdAt' | 'updatedAt'>
  ): Medication {
    const stmt = this.db.prepare(`
      INSERT INTO medications (
        uid, name, time, frequency, custom_days, dose, amount, instructions,
        last_taken, next_due
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        uid,
        medication.name,
        medication.time,
        medication.frequency,
        medication.customDays || null,
        medication.dose || null,
        medication.amount || null,
        medication.instructions || null,
        medication.lastTaken ? medication.lastTaken.toISOString() : null,
        medication.nextDue ? medication.nextDue.toISOString() : null
      );

      const created = this.getMedication(uid, medication.name);
      if (!created) {
        throw new Error('Failed to retrieve created medication');
      }
      return created;
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        throw new Error(`Medication "${medication.name}" already exists for this user`);
      }
      throw error;
    }
  }

  updateMedication(uid: string, medName: string, updates: Partial<Medication>): Medication | null {
    // First check if medication exists
    const existing = this.getMedication(uid, medName);
    if (!existing) return null;

    // Build dynamic update query
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.time !== undefined) {
      fields.push('time = ?');
      values.push(updates.time);
    }
    if (updates.frequency !== undefined) {
      fields.push('frequency = ?');
      values.push(updates.frequency);
    }
    if (updates.customDays !== undefined) {
      fields.push('custom_days = ?');
      values.push(updates.customDays || null);
    }
    if (updates.dose !== undefined) {
      fields.push('dose = ?');
      values.push(updates.dose || null);
    }
    if (updates.amount !== undefined) {
      fields.push('amount = ?');
      values.push(updates.amount || null);
    }
    if (updates.instructions !== undefined) {
      fields.push('instructions = ?');
      values.push(updates.instructions || null);
    }
    if (updates.taken !== undefined) {
      fields.push('taken = ?');
      values.push(updates.taken ? 1 : 0);
    }
    if (updates.reminderSent !== undefined) {
      fields.push('reminder_sent = ?');
      values.push(updates.reminderSent ? 1 : 0);
    }
    if (updates.lastTaken !== undefined) {
      fields.push('last_taken = ?');
      values.push(updates.lastTaken ? updates.lastTaken.toISOString() : null);
    }
    if (updates.nextDue !== undefined) {
      fields.push('next_due = ?');
      values.push(updates.nextDue ? updates.nextDue.toISOString() : null);
    }

    if (fields.length === 0) {
      return existing; // No updates
    }

    // Add WHERE clause values
    values.push(uid, medName);

    const stmt = this.db.prepare(`
      UPDATE medications 
      SET ${fields.join(', ')}
      WHERE uid = ? AND name = ?
    `);

    stmt.run(...values);
    return this.getMedication(uid, medName);
  }

  removeMedication(uid: string, medName: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM medications 
      WHERE uid = ? AND name = ?
    `);
    
    const result = stmt.run(uid, medName);
    return result.changes > 0;
  }

  getAllUserMedications(): { uid: string; medications: Medication[] }[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT uid FROM medications
    `);
    
    const uids = stmt.all() as { uid: string }[];
    
    return uids.map(({ uid }) => ({
      uid,
      medications: this.getUserMedications(uid)
    }));
  }

  resetDailyMedications(): void {
    // Reset daily medications
    const dailyStmt = this.db.prepare(`
      UPDATE medications 
      SET taken = 0, reminder_sent = 0
      WHERE frequency = 'daily'
    `);
    dailyStmt.run();

    // Reset reminder_sent for non-daily medications
    const nonDailyStmt = this.db.prepare(`
      UPDATE medications 
      SET reminder_sent = 0
      WHERE frequency != 'daily'
    `);
    nonDailyStmt.run();

    console.log('✅ Daily medication status reset');
  }

  getAllUsers(): string[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT uid FROM medications
    `);
    
    const rows = stmt.all() as { uid: string }[];
    return rows.map(row => row.uid);
  }

  deleteUserMedications(uid: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM medications WHERE uid = ?
    `);
    
    const result = stmt.run(uid);
    return result.changes > 0;
  }

  // Utility method to save (not used in SQL, kept for compatibility)
  saveUserMedications(uid: string, medications: Medication[]): void {
    // This is a no-op for SQL since we update directly
    // Kept for backward compatibility with the interface
  }

  // Close database connection (useful for testing)
  close(): void {
    this.db.close();
  }
}

// Singleton instance
export const storageService = new StorageService();