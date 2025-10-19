// src/discord-bot/commands/commandHandlers.ts
import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { apiClient } from '../services/apiClient';

export async function handleAddMed(interaction: ChatInputCommandInteraction): Promise<void> {
  const medName = interaction.options.getString('name', true);
  const time = interaction.options.getString('time', true);

  try {
    // Get or create user
    const user = await apiClient.getOrCreateUser(interaction.user.id);

    // Add medication
    await apiClient.createMedication(user.uid, medName, time);

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
    // Get or create user
    const user = await apiClient.getOrCreateUser(interaction.user.id);

    // Get medications
    const userMeds = await apiClient.getUserMedications(user.uid);

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
    // Get user
    const user = await apiClient.getOrCreateUser(interaction.user.id);

    // Remove medication
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

export async function handleWebConnect(interaction: ChatInputCommandInteraction): Promise<void> {
  try {
    // Get or create user
    const user = await apiClient.getOrCreateUser(interaction.user.id);

    // Generate connect token
    const { token } = await apiClient.generateConnectToken(user.uid);

    // Use PWA_URL if set, otherwise use API_URL base
    const pwaUrl = process.env.PWA_URL || process.env.API_URL?.replace('/api', '') || 'http://localhost:3000';
    const connectUrl = `${pwaUrl}/connect?token=${token}`;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🔗 Connect to Web App')
      .setDescription(
        `Click the link below to connect this Discord account to the web app:\n\n` +
        `[**Open Web App**](${connectUrl})\n\n` +
        `⏰ This link expires in 10 minutes.`
      )
      .setFooter({ text: 'Keep this link private!' })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate connect link';
    await interaction.reply({
      content: `❌ ${errorMessage}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

export async function handleLink(interaction: ChatInputCommandInteraction): Promise<void> {
  const code = interaction.options.getString('code', true).toUpperCase();

  try {
    // Validate the link code
    const { uid, user } = await apiClient.validateLinkCode(code);

    // Check if this Discord user is already linked
    try {
      const existingUser = await apiClient.getUserByDiscordId(interaction.user.id);
      await interaction.reply({
        content: `❌ Your Discord account is already linked to an account.\n\nIf you want to link to a different account, please contact support.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    } catch {
      // User not found, proceed with linking
    }

    // Check if the UID already has a Discord account linked
    if (user.discordId) {
      await interaction.reply({
        content: `❌ This link code is already connected to another Discord account.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Link Discord ID to the user
    await apiClient.linkDiscordToUser(uid, interaction.user.id);

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('✅ Account Linked Successfully!')
      .setDescription(
        `Your Discord account has been linked to your web app account.\n\n` +
        `You can now manage your medications from both Discord and the web app!`
      )
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Invalid or expired link code';
    await interaction.reply({
      content: `❌ ${errorMessage}\n\nLink codes expire after 10 minutes. Please generate a new one from the web app.`,
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
        name: '/webconnect',
        value: 'Get a link to connect this Discord account to the web app',
      },
      {
        name: '/link',
        value: 'Link your Discord account using a code from the web app\n*Example: `/link code:ABC123`*',
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
        '• Status resets daily at midnight\n' +
        '• Use the web app for a better experience on mobile/desktop',
    })
    .setFooter({ text: 'Stay healthy! 💙' });

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}