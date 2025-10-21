// src/discord-bot/handlers/interactionHandler.ts
import { Client, Interaction, EmbedBuilder, MessageFlags } from 'discord.js';
import { apiClient } from '../services/apiClient';
import {
  handleAddMed,
  handleListMeds,
  handleEditMed,
  handleRemoveMed,
  handleTimezone,
  handleHelp,
} from '../commands/commandHandlers';

const pendingReminders = new Map<string, NodeJS.Timeout>();

export async function handleInteraction(
  interaction: Interaction,
  client: Client
): Promise<void> {
  if (interaction.isChatInputCommand()) {
    try {
      switch (interaction.commandName) {
        case 'addmed':
          await handleAddMed(interaction);
          break;
        case 'listmeds':
          await handleListMeds(interaction);
          break;
        case 'editmed':
          await handleEditMed(interaction);
          break;
        case 'removemed':
          await handleRemoveMed(interaction);
          break;
        case 'timezone':
          await handleTimezone(interaction);
          break;
        case 'help':
          await handleHelp(interaction);
          break;
        default:
          await interaction.reply({
            content: '❌ Unknown command',
            flags: MessageFlags.Ephemeral,
          });
      }
    } catch (error) {
      console.error('Error handling button:', error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '❌ An error occurred while processing your action.',
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: '❌ An error occurred while processing your action.',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
}

async function handleButtonInteraction(interaction: Interaction): Promise<void> {
  if (!interaction.isButton()) return;

  const discordId = interaction.user.id;
  const [action, , medName] = interaction.customId.split('_');

  if (action === 'take') {
    try {
      const user = await apiClient.getUserByDiscordId(discordId);
      await apiClient.markMedicationTaken(user.uid, medName);

      const reminderId = `${user.uid}-${medName}`;
      cancelPendingReminder(reminderId);

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('✅ Medication Taken')
        .setDescription(`Great! You've marked **${medName}** as taken.`)
        .setTimestamp();

      await interaction.update({ embeds: [embed], components: [] });
    } catch (error) {
      await interaction.reply({
        content: '❌ Could not find this medication in your list.',
        flags: MessageFlags.Ephemeral,
      });
    }
  } else if (action === 'skip') {
    const embed = new EmbedBuilder()
      .setColor(0xFEE75C)
      .setTitle('⏭️ Medication Skipped')
      .setDescription(`You've skipped **${medName}**. Remember to take it when you can!`)
      .setTimestamp();

    await interaction.update({ embeds: [embed], components: [] });
  }
}

export function setPendingReminder(reminderId: string, timeout: NodeJS.Timeout): void {
  pendingReminders.set(reminderId, timeout);
}

export function cancelPendingReminder(reminderId: string): boolean {
  const timeout = pendingReminders.get(reminderId);
  if (timeout) {
    clearTimeout(timeout);
    pendingReminders.delete(reminderId);
    return true;
  }
  return false;
} handling command:', error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '❌ An error occurred while processing your command.',
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: '❌ An error occurred while processing your command.',
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }

  if (interaction.isButton()) {
    try {
      await handleButtonInteraction(interaction);
    } catch (error) {
      console.error('Error