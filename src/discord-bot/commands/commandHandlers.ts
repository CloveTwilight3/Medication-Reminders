// src/discord-bot/commands/commandHandlers.ts
import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { apiClient } from '../services/apiClient';

export async function handleAddMed(interaction: ChatInputCommandInteraction): Promise<void> {
  const medName = interaction.options.getString('name', true);
  const time = interaction.options.getString('time', true);

  try {
    await apiClient.createMedication(interaction.user.id, medName, time);

    await interaction.reply({
      content: `✅ Added medication reminder for **${medName}** at **${time}** daily.\n\n*You will receive DM reminders at this time each day.*`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add medication';
    await interaction.reply({
      content: `❌ ${errorMessage}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleListMeds(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    const userMeds = await apiClient.getUserMedications(interaction.user.id);

    if (userMeds.length === 0) {
      await interaction.reply({
        content: '📭 You have no medications scheduled. Use `/addmed` to add one.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('💊 Your Medications')
      .setDescription(
        userMeds
          .map(med => `**${med.name}** - ${med.time} ${med.taken ? '✅' : '⏳'}`)
          .join('\n')
      )
      .setFooter({ text: '✅ = Taken today | ⏳ = Not taken yet' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } catch (error) {
    await interaction.reply({
      content: '❌ Failed to retrieve your medications.',
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleRemoveMed(interaction: ChatInputCommandInteraction): Promise<void> {
  const medName = interaction.options.getString('name', true);

  try {
    await apiClient.deleteMedication(interaction.user.id, medName);

    await interaction.reply({
      content: `✅ Removed medication **${medName}**.`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Medication not found';
    await interaction.reply({
      content: `❌ ${errorMessage}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleHelp(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('💊 Medication Reminder Bot - Help')
    .setDescription('Commands to manage your medication reminders:')
    .addFields(
      {
        name: '/addmed',
        value: 'Add a daily medication reminder\n*Example: `/addmed name:Aspirin time:09:00`*',
      },
      {
        name: '/listmeds',
        value: 'List all your scheduled medications and their status',
      },
      {
        name: '/removemed',
        value: 'Remove a medication reminder\n*Example: `/removemed name:Aspirin`*',
      },
      {
        name: '/help',
        value: 'Show this help message',
      }
    )
    .addFields({
      name: '📬 How it works',
      value:
        '• You\'ll receive DM reminders at your scheduled times\n' +
        '• Click the **✓ Taken** button once you take your medication\n' +
        '• If not marked as taken, you\'ll get a follow-up reminder after 1 hour\n' +
        '• Status resets daily at midnight',
    })
    .setFooter({ text: 'Stay healthy! 💙' });

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}