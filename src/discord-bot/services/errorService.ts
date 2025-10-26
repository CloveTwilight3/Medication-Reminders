/** src/discord-bot/services/errorService.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import * as fs from 'fs';
import * as path from 'path';
import { randomBytes, createHash } from 'crypto';
import { ChatInputCommandInteraction } from 'discord.js';

interface ErrorLog {
  errorHash: string;
  timestamp: string;
  userId: string;
  username: string;
  commandName: string;
  subcommand?: string;
  errorMessage: string;
  errorStack?: string;
  additionalContext?: Record<string, any>;
}

export class ErrorService {
  private static instance: ErrorService;
  private errorLogPath: string;

  private constructor() {
    // Ensure errors directory exists
    const errorDir = path.join(process.cwd(), 'data', 'errors');
    if (!fs.existsSync(errorDir)) {
      fs.mkdirSync(errorDir, { recursive: true });
    }
    
    this.errorLogPath = path.join(errorDir, 'error-log.txt');
    
    // Create file if it doesn't exist
    if (!fs.existsSync(this.errorLogPath)) {
      fs.writeFileSync(this.errorLogPath, '# Discord Bot Error Log\n# Format: [HASH] [TIMESTAMP] [USER] [COMMAND] [ERROR]\n\n', 'utf-8');
    }
    
    console.log('✅ Error service initialized');
    console.log(`📝 Error log path: ${this.errorLogPath}`);
  }

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Generate a unique error hash
   */
  private generateErrorHash(): string {
    // Generate a random 8-character hash
    return randomBytes(4).toString('hex');
  }

  /**
   * Create a deterministic hash from error content (for deduplication)
   */
  private createContentHash(errorMessage: string, commandName: string): string {
    const content = `${commandName}:${errorMessage}`;
    return createHash('md5').update(content).digest('hex').substring(0, 8);
  }

  /**
   * Log an error with all details
   */
  logError(
    interaction: ChatInputCommandInteraction,
    error: Error | string,
    additionalContext?: Record<string, any>
  ): string {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Generate unique error hash
    const errorHash = this.generateErrorHash();
    
    // Create error log object
    const errorLog: ErrorLog = {
      errorHash,
      timestamp: new Date().toISOString(),
      userId: interaction.user.id,
      username: `${interaction.user.username}#${interaction.user.discriminator}`,
      commandName: interaction.commandName,
      subcommand: interaction.options.getSubcommand(false) || undefined,
      errorMessage,
      errorStack,
      additionalContext
    };

    // Format error log entry
    const logEntry = this.formatErrorLog(errorLog);
    
    // Append to log file
    try {
      fs.appendFileSync(this.errorLogPath, logEntry + '\n\n', 'utf-8');
      console.error(`❌ Error logged with hash: ${errorHash}`);
    } catch (err) {
      console.error('Failed to write error log:', err);
    }

    return errorHash;
  }

  /**
   * Format error log for plaintext storage
   */
  private formatErrorLog(log: ErrorLog): string {
    const lines: string[] = [];
    
    lines.push('='.repeat(80));
    lines.push(`ERROR HASH: ${log.errorHash}`);
    lines.push(`TIMESTAMP: ${log.timestamp}`);
    lines.push(`USER: ${log.username} (${log.userId})`);
    lines.push(`COMMAND: /${log.commandName}${log.subcommand ? ' ' + log.subcommand : ''}`);
    lines.push('-'.repeat(80));
    lines.push(`ERROR MESSAGE:`);
    lines.push(log.errorMessage);
    
    if (log.errorStack) {
      lines.push('-'.repeat(80));
      lines.push(`STACK TRACE:`);
      lines.push(log.errorStack);
    }
    
    if (log.additionalContext && Object.keys(log.additionalContext).length > 0) {
      lines.push('-'.repeat(80));
      lines.push(`ADDITIONAL CONTEXT:`);
      lines.push(JSON.stringify(log.additionalContext, null, 2));
    }
    
    lines.push('='.repeat(80));
    
    return lines.join('\n');
  }

  /**
   * Search for an error by hash
   */
  findErrorByHash(errorHash: string): string | null {
    try {
      const content = fs.readFileSync(this.errorLogPath, 'utf-8');
      
      // Find the error entry by hash
      const entries = content.split('='.repeat(80));
      for (const entry of entries) {
        if (entry.includes(`ERROR HASH: ${errorHash}`)) {
          return entry.trim();
        }
      }
      
      return null;
    } catch (err) {
      console.error('Failed to read error log:', err);
      return null;
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): { totalErrors: number; recentErrors: number } {
    try {
      const content = fs.readFileSync(this.errorLogPath, 'utf-8');
      const entries = content.split('ERROR HASH:').length - 1;
      
      // Count errors from last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const lines = content.split('\n');
      let recentErrors = 0;
      
      for (const line of lines) {
        if (line.startsWith('TIMESTAMP:')) {
          const timestamp = line.replace('TIMESTAMP:', '').trim();
          const errorDate = new Date(timestamp);
          if (errorDate > oneDayAgo) {
            recentErrors++;
          }
        }
      }
      
      return {
        totalErrors: entries,
        recentErrors
      };
    } catch (err) {
      console.error('Failed to get error stats:', err);
      return { totalErrors: 0, recentErrors: 0 };
    }
  }

  /**
   * Clear old errors (older than 30 days)
   */
  clearOldErrors(): number {
    try {
      const content = fs.readFileSync(this.errorLogPath, 'utf-8');
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const entries = content.split('='.repeat(80) + '\n');
      const header = entries[0]; // Keep the header
      let kept = 0;
      let removed = 0;
      
      const filteredEntries = entries.slice(1).filter(entry => {
        if (!entry.trim()) return false;
        
        const timestampMatch = entry.match(/TIMESTAMP: (.+)/);
        if (!timestampMatch) return true;
        
        const errorDate = new Date(timestampMatch[1]);
        if (errorDate > thirtyDaysAgo) {
          kept++;
          return true;
        } else {
          removed++;
          return false;
        }
      });
      
      const newContent = header + '='.repeat(80) + '\n' + filteredEntries.join('='.repeat(80) + '\n');
      fs.writeFileSync(this.errorLogPath, newContent, 'utf-8');
      
      console.log(`🗑️ Cleared ${removed} old errors, kept ${kept} recent errors`);
      return removed;
    } catch (err) {
      console.error('Failed to clear old errors:', err);
      return 0;
    }
  }

  /**
   * Get the error log file path (for manual inspection)
   */
  getLogFilePath(): string {
    return this.errorLogPath;
  }
}

export const errorService = ErrorService.getInstance();