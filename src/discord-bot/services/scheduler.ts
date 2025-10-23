/** src/discord-bot/services/scheduler.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import { Client } from 'discord.js';
import schedule from 'node-schedule';
import { apiClient } from './apiClient';
import { sendMedicationReminder, sendFollowUpReminder } from './reminderService';
import { setPendingReminder } from '../handlers/interactionHandler';

export function setupScheduler(client: Client): void {
  // Check every minute for medications that need reminders
  schedule.scheduleJob('* * * * *', () => {
    checkMedicationReminders(client);
  });

  // Reset taken status at midnight UTC
  schedule.scheduleJob('0 0 * * *', async () => {
    try {
      await apiClient.resetDailyMedications();
      console.log('✅ Daily medication status reset');
    } catch (error) {
      console.error('❌ Error resetting daily medications:', error);
    }
  });

  console.log('✅ Medication scheduler initialized');
  console.log('ℹ️  Checking medications every minute');
  console.log('ℹ️  Daily reset at midnight UTC');
}

async function checkMedicationReminders(client: Client): Promise<void> {
  try {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    
    console.log(`🕐 [${now.toISOString()}] Checking medications (UTC ${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')})`);

    const dueMedications = await apiClient.getMedicationsDueNow();

    if (dueMedications.length > 0) {
      console.log(`📋 Found ${dueMedications.length} medication(s) due for reminders`);
    }

    for (const { uid, medication, userTimezone } of dueMedications) {
      // Get user info to find Discord ID
      try {
        const user = await apiClient.getUser(uid);
        
        // Only send Discord reminders if user has linked Discord
        if (!user.discordId) {
          console.log(`⚠️  User ${uid} has no Discord ID linked, skipping Discord reminder`);
          // Mark reminder as sent so we don't keep trying
          await apiClient.updateMedication(uid, medication.name, {
            reminderSent: true
          });
          continue;
        }

        console.log(`📤 Sending reminder to ${user.discordId} for ${medication.name} (Timezone: ${userTimezone})`);

        // Send initial reminder via Discord
        await sendMedicationReminder(client, user.discordId, medication);

        // Mark reminder as sent via API
        try {
          await apiClient.updateMedication(uid, medication.name, {
            reminderSent: true
          });
          console.log(`✅ Marked ${medication.name} reminder as sent for user ${uid}`);
        } catch (error) {
          console.error(`❌ Failed to update reminder status for ${medication.name}:`, error);
        }

        // Schedule follow-up reminder in 1 hour if not taken
        const reminderId = `${uid}-${medication.name}`;
        const timeout = setTimeout(async () => {
          try {
            // Check if medication has been taken
            const currentMed = await apiClient.getMedication(uid, medication.name);
            if (!currentMed.taken && user.discordId) {
              console.log(`📤 Sending follow-up reminder for ${medication.name} to user ${uid}`);
              await sendFollowUpReminder(client, user.discordId, medication);
            } else {
              console.log(`ℹ️  Skipping follow-up for ${medication.name} - already taken`);
            }
          } catch (error) {
            console.error(`❌ Failed to send follow-up for ${medication.name}:`, error);
          }
        }, 60 * 60 * 1000); // 1 hour

        setPendingReminder(reminderId, timeout);
      } catch (error) {
        console.error(`❌ Failed to get user info for uid ${uid}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error checking medication reminders:', error);
  }
}