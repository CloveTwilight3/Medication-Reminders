// src/discord-bot/services/reminderService.ts
import { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Medication, FrequencyType } from '../types';

const FREQUENCY_DISPLAY: Record<FrequencyType, string> = {
  'daily': 'Daily',
  'every-2-days': 'Every 2 days',
  'weekly': 'Weekly',
  'bi-weekly': 'Bi-weekly',
  'monthly': 'Monthly'
};

export async function sendMedicationReminder(
  client: Client,
  discordId: string,
  med: Medication
): Promise<void> {
  try {
    const user = await client.users.fetch(discordId);
    
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('💊 Medication Reminder')
      .setDescription(`It's time to take your medication: **${med.name}**`)
      .addFields(
        { name: 'Frequency', value: FREQUENCY_DISPLAY[med.frequency], inline: true },
        { name: 'Time', value: med.time, inline: true }
      );

    if (med.dose) {
      embed.addFields({ name: 'Dose', value: med.dose, inline: true });
    }
    
    if (med.amount) {
      embed.addFields({ name: 'Amount', value: med.amount, inline: true });
    }
    
    if (med.instructions) {
      embed.addFields({ name: 'Instructions', value: med.instructions });
    }

    embed.setTimestamp()
      .setFooter({ text: 'Click the button below once you\'ve taken it' });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`take_med_${med.name}`)
          .setLabel('✓ Taken')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`skip_med_${med.name}`)
          .setLabel('Skip')
          .setStyle(ButtonStyle.Secondary)
      );

    await user.send({ embeds: [embed], components: [row] });
  } catch (err) {
    console.error(`Failed to send reminder to Discord user ${discordId}:`, err);
  }
}

export async function sendFollowUpReminder(
  client: Client,
  discordId: string,
  med: Medication
): Promise<void> {
  try {
    const user = await client.users.fetch(discordId);
    
    const embed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle('⚠️ Medication Reminder (Follow-up)')
      .setDescription(`You haven't marked **${med.name}** as taken yet. Please remember to take it!`)
      .addFields(
        { name: 'Frequency', value: FREQUENCY_DISPLAY[med.frequency], inline: true }
      );

    if (med.dose) {
      embed.addFields({ name: 'Dose', value: med.dose, inline: true });
    }
    
    if (med.amount) {
      embed.addFields({ name: 'Amount', value: med.amount, inline: true });
    }

    embed.setTimestamp()
      .setFooter({ text: 'This is a follow-up reminder' });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`take_med_${med.name}`)
          .setLabel('✓ Taken')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`skip_med_${med.name}`)
          .setLabel('Skip')
          .setStyle(ButtonStyle.Secondary)
      );

    await user.send({ embeds: [embed], components: [row] });
  } catch (err) {
    console.error(`Failed to send follow-up to Discord user ${discordId}:`, err);
  }
}