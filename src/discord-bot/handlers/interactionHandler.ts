// src/discord-bot/handlers/interactionHandler.ts - V2.5 with /dashboard
import { Client, Interaction, EmbedBuilder, MessageFlags, AutocompleteInteraction } from 'discord.js';
import { apiClient } from '../services/apiClient';
import {
  handleMedCommand,
  handleDashboard,
  handleTimezone,
  handleHelp,
} from '../commands/commandHandlers';

const pendingReminders = new Map<string, NodeJS.Timeout>();

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

    // Only handle autocomplete for /med edit and /med remove
    if (commandName !== 'med') {
      await interaction.respond([]);
      return;
    }

    // Only handle 'name' field autocomplete
    if (focusedOption.name !== 'name') {
      await interaction.respond([]);
      return;
    }

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