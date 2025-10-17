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

    for (const { userId, medication } of dueMedications) {
      // Send initial reminder
      await sendMedicationReminder(client, userId, medication);

      // Mark reminder as sent via API
      try {
        await apiClient.updateMedication(userId, medication.name, {
          reminderSent: true
        });
      } catch (error) {
        console.error(`Failed to update reminder status for ${medication.name}:`, error);
      }

      // Schedule follow-up reminder in 1 hour if not taken
      const reminderId = `${userId}-${medication.name}`;
      const timeout = setTimeout(async () => {
        try {
          // Check if medication has been taken
          const currentMed = await apiClient.getMedication(userId, medication.name);
          if (!currentMed.taken) {
            await sendFollowUpReminder(client, userId, medication);
          }
        } catch (error) {
          console.error(`Failed to send follow-up for ${medication.name}:`, error);
        }
      }, 60 * 60 * 1000); // 1 hour

      setPendingReminder(reminderId, timeout);
    }
  } catch (error) {
    console.error('❌ Error checking medication reminders:', error);
  }
}