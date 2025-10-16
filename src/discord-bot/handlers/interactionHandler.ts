// src/discord-bot/handlers/interactionHandler.ts
import { Client, Interaction, EmbedBuilder } from 'discord.js';
import { storage } from '../services/storage';
import {
  handleAddMed,
  handleListMeds,
  handleRemoveMed,
  handleHelp,
} from '../commands/commandHandlers';

export async function handleInteraction(
  interaction: Interaction,
  client: Client
): Promise<void> {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    try {
      switch (interaction.commandName) {
        case 'addmed':
          await handleAddMed(interaction);
          break;
        case 'listmeds':
          await handleListMeds(interaction);
          break;
        case 'removemed':
          await handleRemoveMed(interaction);
          break;
        case 'help':
          await handleHelp(interaction);
          break;
        default:
          await interaction.reply({
            content: '❌ Unknown command',
            ephemeral: true,
          });
      }
    } catch (error) {
      console.error('Error handling command:', error);
      
      const errorMessage = {
        content: '❌ An error occurred while processing your command.',
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  }

  // Handle button interactions
  if (interaction.isButton()) {
    try {
      await handleButtonInteraction(interaction);
    } catch (error) {
      console.error('Error handling button:', error);
      
      const errorMessage = {
        content: '❌ An error occurred while processing your action.',
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  }
}

async function handleButtonInteraction(interaction: Interaction): Promise<void> {
  if (!interaction.isButton()) return;

  const userId = interaction.user.id;
  const [action, , medName] = interaction.customId.split('_');

  if (action === 'take') {
    const success = storage.markMedicationTaken(userId, medName);

    if (success) {
      // Cancel pending follow-up reminder
      const reminderId = `${userId}-${medName}`;
      storage.cancelPendingReminder(reminderId);

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('✅ Medication Taken')
        .setDescription(`Great! You've marked **${medName}** as taken.`)
        .setTimestamp();

      await interaction.update({ embeds: [embed], components: [] });
    } else {
      await interaction.reply({
        content: '❌ Could not find this medication in your list.',
        ephemeral: true,
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