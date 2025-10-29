/** src/discord-bot/commands/commandHandlers.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { apiClient } from '../services/apiClient';
import { errorService } from '../services/errorService';
import { FrequencyType, Medication } from '../../api/types';

const PWA_URL = process.env.PWA_URL || process.env.API_URL?.replace('/api', '') || 'https://www.cuddle-blahaj.win';

const FREQUENCY_DISPLAY: Record<FrequencyType, string> = {
  'daily': 'Daily',
  'every-2-days': 'Every 2 days',
  'weekly': 'Weekly',
  'bi-weekly': 'Bi-weekly (every 2 weeks)',
  'monthly': 'Monthly',
  'custom': 'Custom'
};

// Helper function to get display text for frequency including custom
function getFrequencyDisplay(med: Medication): string {
  if (med.frequency === 'custom' && med.customDays) {
    return `Custom (every ${med.customDays} days)`;
  }
  return FREQUENCY_DISPLAY[med.frequency] || med.frequency;
}

// Helper function to create error embed
function createErrorEmbed(errorMessage: string, errorHash: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xED4245) // Red color for errors
    .setTitle('❌ Error')
    .setDescription(errorMessage)
    .setFooter({ text: `Error: ${errorHash}` })
    .setTimestamp();
}

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
    const errorHash = errorService.logError(interaction, error as Error);
    const errorEmbed = createErrorEmbed(
      `Failed to load dashboard link. Please visit: ${PWA_URL}`,
      errorHash
    );
    await interaction.reply({
      embeds: [errorEmbed],
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleAddMed(interaction: ChatInputCommandInteraction): Promise<void> {
  const medName = interaction.options.getString('name', true);
  const time = interaction.options.getString('time', true);
  const frequency = interaction.options.getString('frequency', true) as FrequencyType;
  const customDays = interaction.options.getInteger('custom_days', false);
  const dose = interaction.options.getString('dose', false);
  const amount = interaction.options.getString('amount', false);
  const instructions = interaction.options.getString('instructions', false);

  try {
    const user = await apiClient.getOrCreateUser(interaction.user.id);

    // Validate custom frequency
    if (frequency === 'custom') {
      if (!customDays || customDays < 1) {
        await interaction.reply({
          content: '❌ For custom frequency, you must specify custom_days (minimum 1 day)',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      if (customDays > 365) {
        await interaction.reply({
          content: '❌ Custom days cannot exceed 365 days',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    await apiClient.createMedication(user.uid, {
      name: medName,
      time,
      frequency,
      customDays: frequency === 'custom' ? customDays! : undefined,
      dose: dose || undefined,
      amount: amount || undefined,
      instructions: instructions || undefined
    });

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('✅ Medication Added')
      .setDescription(`Added **${medName}**`)
      .addFields(
        { name: 'Frequency', value: frequency === 'custom' ? `Custom (every ${customDays} days)` : FREQUENCY_DISPLAY[frequency], inline: true },
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
    const errorHash = errorService.logError(interaction, error as Error, {
      medName,
      time,
      frequency,
      customDays,
      dose,
      amount,
      instructions
    });
    const errorEmbed = createErrorEmbed(errorMessage, errorHash);
    await interaction.reply({
      embeds: [errorEmbed],
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
            let line = `**${med.name}** - ${med.time} (${getFrequencyDisplay(med)}) ${status}`;
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
    const errorHash = errorService.logError(interaction, error as Error);
    const errorEmbed = createErrorEmbed('Failed to retrieve your medications.', errorHash);
    await interaction.reply({
      embeds: [errorEmbed],
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleEditMed(interaction: ChatInputCommandInteraction): Promise<void> {
  const medName = interaction.options.getString('name', true);
  const time = interaction.options.getString('time', false);
  const frequency = interaction.options.getString('frequency', false) as FrequencyType | null;
  const customDays = interaction.options.getInteger('custom_days', false);
  const dose = interaction.options.getString('dose', false);
  const amount = interaction.options.getString('amount', false);
  const instructions = interaction.options.getString('instructions', false);

  try {
    const user = await apiClient.getOrCreateUser(interaction.user.id);

    // Validate custom frequency
    if (frequency === 'custom') {
      if (!customDays || customDays < 1) {
        await interaction.reply({
          content: '❌ For custom frequency, you must specify custom_days (minimum 1 day)',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      if (customDays > 365) {
        await interaction.reply({
          content: '❌ Custom days cannot exceed 365 days',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    // Build updates object
    const updates: any = {};
    if (time) updates.time = time;
    if (frequency) {
      updates.frequency = frequency;
      if (frequency === 'custom') {
        updates.customDays = customDays;
      }
    }
    if (customDays !== null && !frequency) {
      // Allow updating customDays independently if frequency isn't being changed
      updates.customDays = customDays || undefined;
    }
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
    if (frequency) {
      const freqDisplay = frequency === 'custom' ? `Custom (every ${customDays} days)` : FREQUENCY_DISPLAY[frequency];
      embed.addFields({ name: 'New Frequency', value: freqDisplay, inline: true });
    }
    if (dose !== null) embed.addFields({ name: 'New Dose', value: dose || 'Removed', inline: true });
    if (amount !== null) embed.addFields({ name: 'New Amount', value: amount || 'Removed', inline: true });
    if (instructions !== null) embed.addFields({ name: 'New Instructions', value: instructions || 'Removed' });

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update medication';
    const errorHash = errorService.logError(interaction, error as Error, {
      medName,
      time,
      frequency,
      customDays,
      dose,
      amount,
      instructions
    });
    const errorEmbed = createErrorEmbed(errorMessage, errorHash);
    await interaction.reply({
      embeds: [errorEmbed],
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
    const errorHash = errorService.logError(interaction, error as Error, { medName });
    const errorEmbed = createErrorEmbed(errorMessage, errorHash);
    await interaction.reply({
      embeds: [errorEmbed],
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
    const errorHash = errorService.logError(interaction, error as Error, { timezone });
    const errorEmbed = createErrorEmbed(
      `${errorMessage}\n\nPlease use a valid timezone like: America/New_York, Europe/London, Asia/Tokyo`,
      errorHash
    );
    await interaction.reply({
      embeds: [errorEmbed],
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleInvite(interaction: ChatInputCommandInteraction): Promise<void> {
  const inviteLink = 'https://www.cuddle-blahaj.win/auth-bot';
  await interaction.reply({
    content: `🤖 Invite the bot to your server or add to user using:\n${inviteLink}`,
    flags: MessageFlags.Ephemeral,
  });
}

export async function handleVersion(interaction: ChatInputCommandInteraction): Promise<void> {
  const version = 'Public Test Beta v1.0.5';
  await interaction.reply({
    content: `💡 Medication Reminder Bot - Current Version: **${version}**`,
    flags: MessageFlags.Ephemeral,
  });
}

export async function handlePing(interaction: ChatInputCommandInteraction): Promise<void> {
  const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true, flags: MessageFlags.Ephemeral });
  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  await interaction.editReply(`🏓 Pong! Latency is **${latency}ms**.`);
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

export async function handleGitHub(interaction: ChatInputCommandInteraction): Promise<void> {
  const githubLink = 'https://github.com/CloveTwilight/Cuddle-Blahaj-Medication';
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('🐙 GitHub Repository')
    .setDescription('Check out the source code for the Medication Reminder Bot on GitHub!')
    .setFooter({ text: 'Open source and community-driven!' })
    .setTimestamp(); 
  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setLabel('View on GitHub')
        .setStyle(ButtonStyle.Link)
        .setURL(githubLink)
        .setEmoji('🐙')
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
        value: 'Add a medication reminder with optional details\n*Required: name, time, frequency*\n*Optional: dose, amount, instructions, custom_days (for custom frequency)*',
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
      name: '🆕 What\'s New in ptb-v1.1.3',
      value:
        '• **Custom Frequency**: Set custom intervals (e.g., every 10 days)\n' +
        '• **Subcommands**: All medication commands now use `/med` prefix\n' +
        '• **Autocomplete**: Start typing medication names in edit/remove commands\n' +
        '• **Dashboard Command**: Quick access to web interface with `/dashboard`\n' +
        '• **Better Organization**: Cleaner command structure',
    })
    .addFields({
      name: '📬 Features',
      value:
        '• **Multiple Frequencies**: Daily, every 2 days, weekly, bi-weekly, monthly, custom\n' +
        '• **Optional Details**: Add dose, amount, and instructions\n' +
        '• **Timezone Support**: Reminders based on your timezone\n' +
        '• **Edit Medications**: Update time, frequency, and details\n' +
        '• **DM Reminders**: Receive notifications at scheduled times\n' +
        `• **Web Dashboard**: Manage medications at ${PWA_URL}`,
    })
    .setFooter({ text: 'Stay healthy! 💙 | Version PTB 1.1.3' });

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