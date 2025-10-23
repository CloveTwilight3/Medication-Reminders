/** src/discord-bot/commands/commandHandlers.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { apiClient } from '../services/apiClient';
import { FrequencyType } from '../../api/types';

const PWA_URL = process.env.PWA_URL || process.env.API_URL?.replace('/api', '') || 'https://www.cuddle-blahaj.win';

const FREQUENCY_DISPLAY: Record<FrequencyType, string> = {
  'daily': 'Daily',
  'every-2-days': 'Every 2 days',
  'weekly': 'Weekly',
  'bi-weekly': 'Bi-weekly (every 2 weeks)',
  'monthly': 'Monthly'
};

// Main /med command handler that routes to subcommands
export async function handleMedCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case 'add':
      await handleAddMed(interaction);
      break;
    case 'list':
      await handleListMeds(interaction);
      break;
    case 'edit':
      await handleEditMed(interaction);
      break;
    case 'remove':
      await handleRemoveMed(interaction);
      break;
    default:
      await interaction.reply({
        content: '❌ Unknown subcommand',
        flags: MessageFlags.Ephemeral,
      });
  }
}

export async function handleDashboard(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    // Verify user exists
    const user = await apiClient.getOrCreateUser(interaction.user.id);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🌐 Web Dashboard')
      .setDescription(
        `Manage your medications from anywhere with our web dashboard!\n\n` +
        `**Features:**\n` +
        `• View all your medications\n` +
        `• Add, edit, and delete medications\n` +
        `• Real-time sync with Discord\n` +
        `• Live updates via WebSocket\n` +
        `• Manage your timezone settings`
      )
      .addFields({
        name: '📱 Access from Any Device',
        value: 'Works on desktop, tablet, and mobile browsers',
        inline: false
      })
      .setFooter({ text: 'Log in with your Discord account' })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Open Dashboard')
          .setStyle(ButtonStyle.Link)
          .setURL(PWA_URL)
          .setEmoji('🌐')
      );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error('Error handling dashboard command:', error);
    await interaction.reply({
      content: `❌ Failed to load dashboard link. Please visit: ${PWA_URL}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleAddMed(interaction: ChatInputCommandInteraction): Promise<void> {
  const medName = interaction.options.getString('name', true);
  const time = interaction.options.getString('time', true);
  const frequency = interaction.options.getString('frequency', true) as FrequencyType;
  const dose = interaction.options.getString('dose', false);
  const amount = interaction.options.getString('amount', false);
  const instructions = interaction.options.getString('instructions', false);

  try {
    const user = await apiClient.getOrCreateUser(interaction.user.id);

    await apiClient.createMedication(user.uid, {
      name: medName,
      time,
      frequency,
      dose: dose || undefined,
      amount: amount || undefined,
      instructions: instructions || undefined
    });

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('✅ Medication Added')
      .setDescription(`Added **${medName}**`)
      .addFields(
        { name: 'Frequency', value: FREQUENCY_DISPLAY[frequency], inline: true },
        { name: 'Time', value: `${time} (your timezone)`, inline: true }
      );

    if (dose) embed.addFields({ name: 'Dose', value: dose, inline: true });
    if (amount) embed.addFields({ name: 'Amount', value: amount, inline: true });
    if (instructions) embed.addFields({ name: 'Instructions', value: instructions });

    embed.setFooter({ text: 'You will receive DM reminders at the scheduled time' });

    await interaction.reply({
      embeds: [embed],
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
    const user = await apiClient.getOrCreateUser(interaction.user.id);
    const userMeds = await apiClient.getUserMedications(user.uid);

    if (userMeds.length === 0) {
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📭 No Medications')
        .setDescription('You have no medications scheduled. Use `/med add` to add one.')
        .setFooter({ text: 'Or use /dashboard to manage via web' });

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Open Dashboard')
            .setStyle(ButtonStyle.Link)
            .setURL(PWA_URL)
            .setEmoji('🌐')
        );

      await interaction.reply({
        embeds: [embed],
        components: [row],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('💊 Your Medications')
      .setDescription(
        userMeds
          .map(med => {
            const status = med.taken ? '✅' : '⏳';
            let line = `**${med.name}** - ${med.time} (${FREQUENCY_DISPLAY[med.frequency]}) ${status}`;
            if (med.dose) line += `\n  └ Dose: ${med.dose}`;
            if (med.amount) line += `\n  └ Amount: ${med.amount}`;
            if (med.instructions) line += `\n  └ Instructions: ${med.instructions}`;
            return line;
          })
          .join('\n\n')
      )
      .setFooter({ text: '✅ = Taken | ⏳ = Not taken yet | Use /dashboard for more options' })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Open Dashboard')
          .setStyle(ButtonStyle.Link)
          .setURL(PWA_URL)
          .setEmoji('🌐')
      );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: MessageFlags.Ephemeral
    });
  } catch (error) {
    await interaction.reply({
      content: '❌ Failed to retrieve your medications.',
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleEditMed(interaction: ChatInputCommandInteraction): Promise<void> {
  const medName = interaction.options.getString('name', true);
  const time = interaction.options.getString('time', false);
  const frequency = interaction.options.getString('frequency', false) as FrequencyType | null;
  const dose = interaction.options.getString('dose', false);
  const amount = interaction.options.getString('amount', false);
  const instructions = interaction.options.getString('instructions', false);

  try {
    const user = await apiClient.getOrCreateUser(interaction.user.id);

    // Build updates object
    const updates: any = {};
    if (time) updates.time = time;
    if (frequency) updates.frequency = frequency;
    if (dose !== null) updates.dose = dose || undefined;
    if (amount !== null) updates.amount = amount || undefined;
    if (instructions !== null) updates.instructions = instructions || undefined;

    if (Object.keys(updates).length === 0) {
      await interaction.reply({
        content: '❌ Please provide at least one field to update.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await apiClient.updateMedication(user.uid, medName, updates);

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('✅ Medication Updated')
      .setDescription(`Updated **${medName}**`);

    if (time) embed.addFields({ name: 'New Time', value: time, inline: true });
    if (frequency) embed.addFields({ name: 'New Frequency', value: FREQUENCY_DISPLAY[frequency], inline: true });
    if (dose !== null) embed.addFields({ name: 'New Dose', value: dose || 'Removed', inline: true });
    if (amount !== null) embed.addFields({ name: 'New Amount', value: amount || 'Removed', inline: true });
    if (instructions !== null) embed.addFields({ name: 'New Instructions', value: instructions || 'Removed' });

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update medication';
    await interaction.reply({
      content: `❌ ${errorMessage}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleRemoveMed(interaction: ChatInputCommandInteraction): Promise<void> {
  const medName = interaction.options.getString('name', true);

  try {
    const user = await apiClient.getOrCreateUser(interaction.user.id);
    await apiClient.deleteMedication(user.uid, medName);

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

export async function handleTimezone(interaction: ChatInputCommandInteraction): Promise<void> {
  const timezone = interaction.options.getString('timezone', true);

  try {
    const user = await apiClient.getOrCreateUser(interaction.user.id);
    await apiClient.updateUserTimezone(user.uid, timezone);

    await interaction.reply({
      content: `✅ Timezone updated to **${timezone}**.\n\nYour reminders will now be sent based on this timezone.`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update timezone';
    await interaction.reply({
      content: `❌ ${errorMessage}\n\nPlease use a valid timezone like: America/New_York, Europe/London, Asia/Tokyo`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleSupport(interaction: ChatInputCommandInteraction): Promise<void> {
  const supportInviteLink = 'https://discord.gg/k8HrBvDaQn';
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('🆘 Support Server')
    .setDescription('Need help or have questions? Join our support server for assistance and community support!')
    .setFooter({ text: 'We are here to help you!' })
    .setTimestamp();
  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setLabel('Join Support Server')
        .setStyle(ButtonStyle.Link)
        .setURL(supportInviteLink)
        .setEmoji('❓')
    );
  await interaction.reply({
    embeds: [embed],
    components: [row],
    flags: MessageFlags.Ephemeral
  });
}

export async function handleHelp(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('💊 Medication Reminder Bot - Help (V2.5)')
    .setDescription('Commands to manage your medication reminders:')
    .addFields(
      {
        name: '/med add',
        value: 'Add a medication reminder with optional details\n*Required: name, time, frequency*\n*Optional: dose, amount, instructions*',
      },
      {
        name: '/med list',
        value: 'List all your scheduled medications with details',
      },
      {
        name: '/med edit',
        value: 'Edit an existing medication (cannot change name)\n*Uses autocomplete for medication names*\n*Example: `/med edit name:Aspirin time:10:00`*',
      },
      {
        name: '/med remove',
        value: 'Remove a medication reminder\n*Uses autocomplete for medication names*\n*Example: `/med remove name:Aspirin`*',
      },
      {
        name: '/dashboard',
        value: 'Open the web dashboard to manage medications from any device\n*Full-featured web interface with real-time sync*',
      },
      {
        name: '/timezone',
        value: 'Set your timezone for accurate reminders\n*Example: `/timezone timezone:America/New_York`*',
      },
      {
        name: '/help',
        value: 'Show this help message',
      }
    )
    .addFields({
      name: '🆕 What\'s New in V2.5',
      value:
        '• **Subcommands**: All medication commands now use `/med` prefix\n' +
        '• **Autocomplete**: Start typing medication names in edit/remove commands\n' +
        '• **Dashboard Command**: Quick access to web interface with `/dashboard`\n' +
        '• **Better Organization**: Cleaner command structure',
    })
    .addFields({
      name: '📬 Features',
      value:
        '• **Multiple Frequencies**: Daily, every 2 days, weekly, bi-weekly, monthly\n' +
        '• **Optional Details**: Add dose, amount, and instructions\n' +
        '• **Timezone Support**: Reminders based on your timezone\n' +
        '• **Edit Medications**: Update time, frequency, and details\n' +
        '• **DM Reminders**: Receive notifications at scheduled times\n' +
        `• **Web Dashboard**: Manage medications at ${PWA_URL}`,
    })
    .setFooter({ text: 'Stay healthy! 💙 | Version 2.5' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setLabel('Open Dashboard')
        .setStyle(ButtonStyle.Link)
        .setURL(PWA_URL)
        .setEmoji('🌐')
    );

  await interaction.reply({
    embeds: [embed],
    components: [row],
    flags: MessageFlags.Ephemeral
  });
}