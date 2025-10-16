// src/discord-bot/services/scheduler.ts
import { Client } from 'discord.js';
import schedule from 'node-schedule';
import { storage } from './storage';
import { sendMedicationReminder, sendFollowUpReminder } from './reminderService';

export function setupScheduler(client: Client): void {
  // Check every minute for medications that need reminders
  schedule.scheduleJob('* * * * *', () => {
    checkMedicationReminders(client);
  });

  // Reset taken status at midnight
  schedule.scheduleJob('0 0 * * *', () => {
    storage.resetDailyMedications();
    console.log('✅ Daily medication status reset');
  });

  console.log('✅ Medication scheduler initialized');
}

function checkMedicationReminders(client: Client): void {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const allMedications = storage.getAllUserMedications();

  for (const [userId, medications] of Object.entries(allMedications)) {
    for (const med of medications) {
      if (med.time === currentTime && !med.taken && !med.reminderSent) {
        sendMedicationReminder(client, userId, med);
        med.reminderSent = true;

        // Schedule follow-up reminder in 1 hour if not taken
        const reminderId = `${userId}-${med.name}`;
        const timeout = setTimeout(() => {
          if (!med.taken) {
            sendFollowUpReminder(client, userId, med);
          }
        }, 60 * 60 * 1000); // 1 hour

        storage.setPendingReminder(reminderId, timeout);
      }
    }
  }
}