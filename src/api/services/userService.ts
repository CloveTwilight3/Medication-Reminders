// src/api/services/userService.ts - SQL version
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { User, SessionToken, UpdateUserRequest } from '../types';
import { randomBytes } from 'crypto';

interface DbUser {
  uid: string;
  discord_id: string | null;
  timezone: string;
  created_at: string;
  created_via: string;
  updated_at: string;
}

interface DbSession {
  token: string;
  uid: string;
  expires_at: string;
  created_at: string;
}

export class UserService {
  private db: Database.Database;

  constructor(dataPath?: string) {
    const baseDir = dataPath || path.join(process.cwd(), 'data');
    
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const dbPath = path.join(baseDir, 'medications.db');
    this.db = new Database(dbPath);
    this.db.pragma('foreign_keys = ON');
    
    console.log('✅ User service initialized with SQL database');
  }

  private dbToUser(row: DbUser): User {
    return {
      uid: row.uid,
      discordId: row.discord_id,
      timezone: row.timezone,
      createdAt: new Date(row.created_at),
      createdVia: row.created_via as 'discord' | 'pwa'
    };
  }

  private generateUid(): string {
    return `uid_${randomBytes(8).toString('hex')}`;
  }

  private validateTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch (error) {
      return false;
    }
  }

  createUser(createdVia: 'discord' | 'pwa', discordId?: string, timezone?: string): User {
    const uid = this.generateUid();
    
    let userTimezone = timezone || 'UTC';
    if (!this.validateTimezone(userTimezone)) {
      console.warn(`Invalid timezone ${userTimezone}, defaulting to UTC`);
      userTimezone = 'UTC';
    }

    const stmt = this.db.prepare(`
      INSERT INTO users (uid, discord_id, timezone, created_via)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(uid, discordId || null, userTimezone, createdVia);

    const user = this.getUser(uid);
    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  updateUser(uid: string, updates: UpdateUserRequest): User | null {
    const user = this.getUser(uid);
    if (!user) return null;

    if (updates.timezone) {
      if (!this.validateTimezone(updates.timezone)) {
        throw new Error('Invalid timezone');
      }

      const stmt = this.db.prepare(`
        UPDATE users SET timezone = ? WHERE uid = ?
      `);
      stmt.run(updates.timezone, uid);
    }

    return this.getUser(uid);
  }

  getUser(uid: string): User | null {
    const stmt = this.db.prepare(`
      SELECT * FROM users WHERE uid = ?
    `);
    
    const row = stmt.get(uid) as DbUser | undefined;
    return row ? this.dbToUser(row) : null;
  }

  getUserByDiscordId(discordId: string): User | null {
    const stmt = this.db.prepare(`
      SELECT * FROM users WHERE discord_id = ?
    `);
    
    const row = stmt.get(discordId) as DbUser | undefined;
    return row ? this.dbToUser(row) : null;
  }

  getAllUsers(): User[] {
    const stmt = this.db.prepare(`
      SELECT * FROM users ORDER BY created_at DESC
    `);
    
    const rows = stmt.all() as DbUser[];
    return rows.map(row => this.dbToUser(row));
  }

  linkDiscordToUser(uid: string, discordId: string): User | null {
    const user = this.getUser(uid);
    if (!user) return null;

    const existingUser = this.getUserByDiscordId(discordId);
    if (existingUser && existingUser.uid !== uid) {
      throw new Error('Discord ID already linked to another account');
    }

    const stmt = this.db.prepare(`
      UPDATE users SET discord_id = ? WHERE uid = ?
    `);
    stmt.run(discordId, uid);

    return this.getUser(uid);
  }

  generateSessionToken(uid: string): string {
    const user = this.getUser(uid);
    if (!user) {
      throw new Error('User not found');
    }

    this.cleanExpiredSessions();

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const stmt = this.db.prepare(`
      INSERT INTO sessions (token, uid, expires_at)
      VALUES (?, ?, ?)
    `);
    stmt.run(token, uid, expiresAt.toISOString());

    return token;
  }

  validateSessionToken(token: string): string | null {
    this.cleanExpiredSessions();

    const stmt = this.db.prepare(`
      SELECT uid FROM sessions 
      WHERE token = ? AND expires_at > datetime('now')
    `);
    
    const row = stmt.get(token) as { uid: string } | undefined;
    return row ? row.uid : null;
  }

  revokeSessionToken(token: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM sessions WHERE token = ?
    `);
    
    const result = stmt.run(token);
    return result.changes > 0;
  }

  private cleanExpiredSessions(): void {
    const stmt = this.db.prepare(`
      DELETE FROM sessions WHERE expires_at <= datetime('now')
    `);
    stmt.run();
  }

  deleteUser(uid: string): boolean {
    // This will cascade delete medications and sessions due to foreign keys
    const stmt = this.db.prepare(`
      DELETE FROM users WHERE uid = ?
    `);
    
    const result = stmt.run(uid);
    return result.changes > 0;
  }

  // Utility method to close database (useful for testing)
  close(): void {
    this.db.close();
  }
}

export const userService = new UserService();