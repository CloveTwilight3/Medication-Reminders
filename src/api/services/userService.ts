// src/api/services/userService.ts
import * as fs from 'fs';
import * as path from 'path';
import { User, SessionToken, UpdateUserRequest } from '../types';
import { randomBytes } from 'crypto';

export class UserService {
  private usersPath: string;
  private sessionsPath: string;
  private users: { [uid: string]: User } = {};
  private sessions: { [token: string]: SessionToken } = {};

  constructor(dataPath?: string) {
    const baseDir = dataPath || path.join(process.cwd(), 'data');
    this.usersPath = path.join(baseDir, 'users.json');
    this.sessionsPath = path.join(baseDir, 'sessions.json');
    
    this.ensureDataDirectory();
    this.loadUsers();
    this.loadSessions();
  }

  private ensureDataDirectory(): void {
    const dataDir = path.dirname(this.usersPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private loadUsers(): void {
    try {
      if (fs.existsSync(this.usersPath)) {
        const data = fs.readFileSync(this.usersPath, 'utf-8');
        this.users = JSON.parse(data);
        console.log('✅ Loaded users from file');
      } else {
        console.log('📝 No existing users file, starting fresh');
        this.saveUsers();
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      this.users = {};
    }
  }

  private saveUsers(): void {
    try {
      fs.writeFileSync(
        this.usersPath,
        JSON.stringify(this.users, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('❌ Error saving users:', error);
      throw new Error('Failed to save users');
    }
  }

  private loadSessions(): void {
    try {
      if (fs.existsSync(this.sessionsPath)) {
        const data = fs.readFileSync(this.sessionsPath, 'utf-8');
        this.sessions = JSON.parse(data);
        this.cleanExpiredSessions();
      } else {
        this.sessions = {};
        this.saveSessions();
      }
    } catch (error) {
      console.error('❌ Error loading sessions:', error);
      this.sessions = {};
    }
  }

  private saveSessions(): void {
    try {
      fs.writeFileSync(
        this.sessionsPath,
        JSON.stringify(this.sessions, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('❌ Error saving sessions:', error);
    }
  }

  private cleanExpiredSessions(): void {
    const now = new Date();
    let changed = false;

    for (const [token, data] of Object.entries(this.sessions)) {
      if (new Date(data.expiresAt) < now) {
        delete this.sessions[token];
        changed = true;
      }
    }

    if (changed) {
      this.saveSessions();
    }
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

  // Create a new user
  createUser(createdVia: 'discord' | 'pwa', discordId?: string, timezone?: string): User {
    const uid = this.generateUid();
    
    // Default to UTC if no timezone provided
    let userTimezone = timezone || 'UTC';
    
    // Validate timezone
    if (!this.validateTimezone(userTimezone)) {
      console.warn(`Invalid timezone ${userTimezone}, defaulting to UTC`);
      userTimezone = 'UTC';
    }

    const user: User = {
      uid,
      discordId: discordId || null,
      timezone: userTimezone,
      createdAt: new Date(),
      createdVia
    };

    this.users[uid] = user;
    this.saveUsers();
    return user;
  }

  // Update user settings
  updateUser(uid: string, updates: UpdateUserRequest): User | null {
    const user = this.users[uid];
    if (!user) return null;

    // Validate timezone if provided
    if (updates.timezone) {
      if (!this.validateTimezone(updates.timezone)) {
        throw new Error('Invalid timezone');
      }
      user.timezone = updates.timezone;
    }

    this.saveUsers();
    return user;
  }

  // Get user by UID
  getUser(uid: string): User | null {
    return this.users[uid] || null;
  }

  // Get user by Discord ID
  getUserByDiscordId(discordId: string): User | null {
    return Object.values(this.users).find(u => u.discordId === discordId) || null;
  }

  // Get all users
  getAllUsers(): User[] {
    return Object.values(this.users);
  }

  // Link Discord ID to existing UID
  linkDiscordToUser(uid: string, discordId: string): User | null {
    const user = this.users[uid];
    if (!user) return null;

    const existingUser = this.getUserByDiscordId(discordId);
    if (existingUser && existingUser.uid !== uid) {
      throw new Error('Discord ID already linked to another account');
    }

    user.discordId = discordId;
    this.saveUsers();
    return user;
  }

  // Generate session token
  generateSessionToken(uid: string): string {
    const user = this.users[uid];
    if (!user) {
      throw new Error('User not found');
    }

    this.cleanExpiredSessions();

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    this.sessions[token] = {
      uid,
      expiresAt
    };

    this.saveSessions();
    return token;
  }

  // Validate session token
  validateSessionToken(token: string): string | null {
    this.cleanExpiredSessions();

    const session = this.sessions[token];
    if (!session) return null;

    return session.uid;
  }

  // Revoke session token (logout)
  revokeSessionToken(token: string): boolean {
    if (!this.sessions[token]) return false;

    delete this.sessions[token];
    this.saveSessions();
    return true;
  }

  // Delete user and all associated data
  deleteUser(uid: string): boolean {
    if (!this.users[uid]) return false;

    delete this.users[uid];
    
    // Remove all sessions for this user
    for (const [token, session] of Object.entries(this.sessions)) {
      if (session.uid === uid) {
        delete this.sessions[token];
      }
    }
    
    this.saveUsers();
    this.saveSessions();
    return true;
  }
}

export const userService = new UserService();