// src/discord-bot/commands/commandHandlers.ts
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { storage } from '../services/storage';

export async function handleAddMed(interaction: ChatInputCommandInteraction): Promise<void> {
  const medName = interaction.options.getString('name', true);
  const time = interaction.options.getString('time', true);

  // Validate time format
  if (!/^\d{2}:\d{2}$/.test(time)) {
    await interaction.reply({
      content: '❌ Invalid time format. Please use HH:MM (e.g., 09:00)',
      ephemeral: true,
    });
    return;
  }

  // Validate time range
  const [hours, minutes] = time.split(':').map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    await interaction.reply({
      content: '❌ Invalid time. Hours must be 00-23 and minutes must be 00-59.',
      ephemeral: true,
    });
    return;
  }

  storage.addMedication(interaction.user.id, {
    name: medName,
    time: time,
    taken: false,
    reminderSent: false,
  });

  await interaction.reply({
    content: `✅ Added medication reminder for **${medName}** at **${time}** daily.\n\n*You will receive DM reminders at this time each day.*`,
    ephemeral: true,
  });
}

export async function handleListMeds(interaction: ChatInputCommandInteraction): Promise<void> {
  const userMeds = storage.getUserMedications(interaction.user.id);

  if (userMeds.length === 0) {
    await interaction.reply({
      content: '📭 You have no medications scheduled. Use `/addmed` to add one.',
      ephemeral: true,
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

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

export async function handleRemoveMed(interaction: ChatInputCommandInteraction): Promise<void> {
  const medName = interaction.options.getString('name', true);

  const success = storage.removeMedication(interaction.user.id, medName);

  if (!success) {
    await interaction.reply({
      content: `❌ Medication **${medName}** not found.`,
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({
    content: `✅ Removed medication **${medName}**.`,
    ephemeral: true,
  });
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

  await interaction.reply({ embeds: [embed], ephemeral: true });
}