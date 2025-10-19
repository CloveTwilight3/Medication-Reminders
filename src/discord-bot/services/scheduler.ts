// src/discord-bot/services/scheduler.ts
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

  // Reset taken status at midnight
  schedule.scheduleJob('0 0 * * *', async () => {
    try {
      await apiClient.resetDailyMedications();
      console.log('✅ Daily medication status reset');
    } catch (error) {
      console.error('❌ Error resetting daily medications:', error);
    }
  });

  console.log('✅ Medication scheduler initialized');
}

async function checkMedicationReminders(client: Client): Promise<void> {
  try {
    const dueMedications = await apiClient.getMedicationsDueNow();

    for (const { uid, medication } of dueMedications) {
      // Get user info to find Discord ID
      try {
        const user = await apiClient.getUser(uid);
        
        // Only send Discord reminders if user has linked Discord
        if (!user.discordId) {
          console.log(`User ${uid} has no Discord ID linked, skipping Discord reminder`);
          // Mark reminder as sent so we don't keep trying
          await apiClient.updateMedication(uid, medication.name, {
            reminderSent: true
          });
          continue;
        }

        // Send initial reminder via Discord
        await sendMedicationReminder(client, user.discordId, medication);

        // Mark reminder as sent via API
        try {
          await apiClient.updateMedication(uid, medication.name, {
            reminderSent: true
          });
        } catch (error) {
          console.error(`Failed to update reminder status for ${medication.name}:`, error);
        }

        // Schedule follow-up reminder in 1 hour if not taken
        const reminderId = `${uid}-${medication.name}`;
        const timeout = setTimeout(async () => {
          try {
            // Check if medication has been taken
            const currentMed = await apiClient.getMedication(uid, medication.name);
            if (!currentMed.taken && user.discordId) {
              await sendFollowUpReminder(client, user.discordId, medication);
            }
          } catch (error) {
            console.error(`Failed to send follow-up for ${medication.name}:`, error);
          }
        }, 60 * 60 * 1000); // 1 hour

        setPendingReminder(reminderId, timeout);
      } catch (error) {
        console.error(`Failed to get user info for uid ${uid}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error checking medication reminders:', error);
  }
}