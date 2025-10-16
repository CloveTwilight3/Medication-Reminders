// src/discord-bot/services/reminderService.ts
import { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Medication } from '../types';

export async function sendMedicationReminder(
  client: Client,
  userId: string,
  med: Medication
): Promise<void> {
  try {
    const user = await client.users.fetch(userId);
    
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('💊 Medication Reminder')
      .setDescription(`It's time to take your medication: **${med.name}**`)
      .setTimestamp()
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
    console.error(`Failed to send reminder to user ${userId}:`, err);
  }
}

export async function sendFollowUpReminder(
  client: Client,
  userId: string,
  med: Medication
): Promise<void> {
  try {
    const user = await client.users.fetch(userId);
    
    const embed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle('⚠️ Medication Reminder (Follow-up)')
      .setDescription(`You haven't marked **${med.name}** as taken yet. Please remember to take it!`)
      .setTimestamp()
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
    console.error(`Failed to send follow-up to user ${userId}:`, err);
  }
}