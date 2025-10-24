/** src/discord-bot/handlers/interactionHandler.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import { Client, Interaction, EmbedBuilder, MessageFlags, AutocompleteInteraction } from 'discord.js';
import { apiClient } from '../services/apiClient';
import {
  handleMedCommand,
  handleDashboard,
  handleTimezone,
  handleHelp,
  handleSupport,
  handleInvite,
  handleVersion,
  handlePing
} from '../commands/commandHandlers';

const pendingReminders = new Map<string, NodeJS.Timeout>();

// List of common timezones for autocomplete
const TIMEZONE_OPTIONS = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Athens',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Pacific/Auckland',
  'UTC'
];

export async function handleInteraction(
  interaction: Interaction,
  client: Client
): Promise<void> {
  // Handle autocomplete interactions
  if (interaction.isAutocomplete()) {
    await handleAutocomplete(interaction);
    return;
  }

  // Handle slash command interactions
  if (interaction.isChatInputCommand()) {
    try {
      switch (interaction.commandName) {
        case 'med':
          await handleMedCommand(interaction);
          break;
        case 'dashboard':
          await handleDashboard(interaction);
          break;
        case 'timezone':
          await handleTimezone(interaction);
          break;
        case 'help':
          await handleHelp(interaction);
          break;
        case 'support':
          await handleSupport(interaction);
          break;
        case 'invite':
          await handleInvite(interaction);
          break;
        case 'version':
          await handleVersion(interaction);
          break;
        case 'ping':
          await handlePing(interaction);
          break;
        default:
          await interaction.reply({
            content: '❌ Unknown command',
            flags: MessageFlags.Ephemeral,
          });
      }
    } catch (error) {
      console.error('Error handling command:', error);

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

  // Handle button interactions
  if (interaction.isButton()) {
    try {
      await handleButtonInteraction(interaction);
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

async function handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
  try {
    const commandName = interaction.commandName;
    const focusedOption = interaction.options.getFocused(true);

    // Handle /med edit and /med remove autocomplete
    if (commandName === 'med' && focusedOption.name === 'name') {
      const discordId = interaction.user.id;
      const user = await apiClient.getUserByDiscordId(discordId);

      if (!user) {
        await interaction.respond([]);
        return;
      }

      // Get user's medications
      const medications = await apiClient.getUserMedications(user.uid);

      // Filter medications based on what the user has typed
      const focusedValue = focusedOption.value.toLowerCase();
      const filtered = medications
        .filter(med => med.name.toLowerCase().includes(focusedValue))
        .slice(0, 25); // Discord limits to 25 choices

      // Return autocomplete choices
      await interaction.respond(
        filtered.map(med => ({
          name: `${med.name} (${med.time} - ${med.frequency})`,
          value: med.name
        }))
      );
      return;
    }

    // ✅ Handle /timezone autocomplete
    if (commandName === 'timezone' && focusedOption.name === 'timezone') {
      const focusedValue = focusedOption.value.toLowerCase();
      
      // Filter timezones based on what the user has typed
      const filtered = TIMEZONE_OPTIONS
        .filter(tz => tz.toLowerCase().includes(focusedValue))
        .slice(0, 25); // Discord limits to 25 choices

      // Return autocomplete choices with friendly names
      await interaction.respond(
        filtered.map(tz => {
          // Create a friendly display name
          const displayName = tz.replace(/_/g, ' ');
          return {
            name: displayName,
            value: tz
          };
        })
      );
      return;
    }

    // Default: respond with empty array for unknown autocomplete
    await interaction.respond([]);
  } catch (error) {
    console.error('Error handling autocomplete:', error);
    // Always respond to autocomplete, even if empty
    await interaction.respond([]);
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
}