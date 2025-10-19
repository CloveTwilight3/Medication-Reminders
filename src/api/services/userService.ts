// src/api/services/userService.ts
import * as fs from 'fs';
import * as path from 'path';
import { User, LinkCode } from '../types';
import { randomBytes } from 'crypto';

export class UserService {
  private usersPath: string;
  private linkCodesPath: string;
  private users: { [uid: string]: User } = {};
  private linkCodes: { [code: string]: LinkCode } = {};

  constructor(dataPath?: string) {
    const baseDir = dataPath || path.join(process.cwd(), 'data');
    this.usersPath = path.join(baseDir, 'users.json');
    this.linkCodesPath = path.join(baseDir, 'link-codes.json');
    
    this.ensureDataDirectory();
    this.loadUsers();
    this.loadLinkCodes();
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

  private loadLinkCodes(): void {
    try {
      if (fs.existsSync(this.linkCodesPath)) {
        const data = fs.readFileSync(this.linkCodesPath, 'utf-8');
        this.linkCodes = JSON.parse(data);
        // Clean expired codes on load
        this.cleanExpiredCodes();
      } else {
        this.linkCodes = {};
        this.saveLinkCodes();
      }
    } catch (error) {
      console.error('❌ Error loading link codes:', error);
      this.linkCodes = {};
    }
  }

  private saveLinkCodes(): void {
    try {
      fs.writeFileSync(
        this.linkCodesPath,
        JSON.stringify(this.linkCodes, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('❌ Error saving link codes:', error);
    }
  }

  private cleanExpiredCodes(): void {
    const now = new Date();
    let changed = false;

    for (const [code, data] of Object.entries(this.linkCodes)) {
      if (new Date(data.expiresAt) < now) {
        delete this.linkCodes[code];
        changed = true;
      }
    }

    if (changed) {
      this.saveLinkCodes();
    }
  }

  private generateUid(): string {
    return `uid_${randomBytes(8).toString('hex')}`;
  }

  private createLinkCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Create a new user
  createUser(createdVia: 'discord' | 'pwa', discordId?: string): User {
    const uid = this.generateUid();
    const user: User = {
      uid,
      discordId: discordId || null,
      createdAt: new Date(),
      createdVia
    };

    this.users[uid] = user;
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

    // Check if Discord ID is already linked to another account
    const existingUser = this.getUserByDiscordId(discordId);
    if (existingUser && existingUser.uid !== uid) {
      throw new Error('Discord ID already linked to another account');
    }

    user.discordId = discordId;
    this.saveUsers();
    return user;
  }

  // Unlink Discord from user
  unlinkDiscord(uid: string): boolean {
    const user = this.users[uid];
    if (!user) return false;

    user.discordId = null;
    this.saveUsers();
    return true;
  }

  // Generate a link code for PWA connection
  generateLinkCode(uid: string): string {
    const user = this.users[uid];
    if (!user) {
      throw new Error('User not found');
    }

    // Clean expired codes first
    this.cleanExpiredCodes();

    // Generate unique code
    let code = this.createLinkCode();
    while (this.linkCodes[code]) {
      code = this.createLinkCode();
    }

    // Code expires in 10 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    this.linkCodes[code] = {
      uid,
      expiresAt
    };

    this.saveLinkCodes();
    return code;
  }

  // Validate and consume a link code
  validateLinkCode(code: string): string | null {
    this.cleanExpiredCodes();

    const linkData = this.linkCodes[code];
    if (!linkData) return null;

    const uid = linkData.uid;

    // Delete the code after use (one-time use)
    delete this.linkCodes[code];
    this.saveLinkCodes();

    return uid;
  }

  // Generate a one-time connect token for /webconnect
  generateConnectToken(uid: string): string {
    const user = this.users[uid];
    if (!user) {
      throw new Error('User not found');
    }

    // Generate cryptographically secure token
    const token = randomBytes(32).toString('hex');
    
    // Store as a link code with token as key
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    this.linkCodes[token] = {
      uid,
      expiresAt
    };

    this.saveLinkCodes();
    return token;
  }

  // Validate connect token (uses same mechanism as link codes)
  validateConnectToken(token: string): string | null {
    this.cleanExpiredCodes();

    const linkData = this.linkCodes[token];
    if (!linkData) return null;

    const uid = linkData.uid;

    // Delete the token after use (one-time use)
    delete this.linkCodes[token];
    this.saveLinkCodes();

    return uid;
  }

  // Delete user and all associated data
  deleteUser(uid: string): boolean {
    if (!this.users[uid]) return false;

    delete this.users[uid];
    this.saveUsers();
    return true;
  }
}

export const userService = new UserService();