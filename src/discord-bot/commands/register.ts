/** src/discord-bot/commands/register.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import { Client, REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
  // Main /med command with subcommands
  new SlashCommandBuilder()
    .setName('med')
    .setDescription('Manage your medications')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a new medication reminder')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Name of the medication')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('time')
            .setDescription('Time to take medication (HH:MM format, e.g., 09:00)')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('frequency')
            .setDescription('How often to take this medication')
            .setRequired(true)
            .addChoices(
              { name: 'Daily', value: 'daily' },
              { name: 'Every 2 Days', value: 'every-2-days' },
              { name: 'Weekly', value: 'weekly' },
              { name: 'Bi-weekly (Every 2 weeks)', value: 'bi-weekly' },
              { name: 'Monthly', value: 'monthly' },
              { name: 'Custom (specify days)', value: 'custom' }
            )
        )
        .addIntegerOption(option =>
          option
            .setName('custom_days')
            .setDescription('For custom frequency: number of days between doses (e.g., 10 for every 10 days)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(365)
        )
        .addStringOption(option =>
          option
            .setName('dose')
            .setDescription('Dose amount (e.g., "10mg", "2 tablets")')
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName('amount')
            .setDescription('Amount to take (e.g., "1 pill", "5ml")')
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName('instructions')
            .setDescription('Special instructions (e.g., "Take with food")')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all your scheduled medications')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('edit')
        .setDescription('Edit an existing medication')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Name of the medication to edit')
            .setRequired(true)
            .setAutocomplete(true) // Enable autocomplete
        )
        .addStringOption(option =>
          option
            .setName('time')
            .setDescription('New time (HH:MM format)')
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName('frequency')
            .setDescription('New frequency')
            .setRequired(false)
            .addChoices(
              { name: 'Daily', value: 'daily' },
              { name: 'Every 2 Days', value: 'every-2-days' },
              { name: 'Weekly', value: 'weekly' },
              { name: 'Bi-weekly', value: 'bi-weekly' },
              { name: 'Monthly', value: 'monthly' },
              { name: 'Custom (specify days)', value: 'custom' }
            )
        )
        .addIntegerOption(option =>
          option
            .setName('custom_days')
            .setDescription('For custom frequency: number of days between doses')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(365)
        )
        .addStringOption(option =>
          option
            .setName('dose')
            .setDescription('New dose amount')
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName('amount')
            .setDescription('New amount to take')
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName('instructions')
            .setDescription('New instructions')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a medication reminder')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('Name of the medication to remove')
            .setRequired(true)
            .setAutocomplete(true) // Enable autocomplete
        )
    )
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),

  // /dashboard command
  new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('Open the web dashboard to manage your medications')
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),

  // /support command
  new SlashCommandBuilder()
    .setName('support')
    .setDescription('Get an invite link to the support server')
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),

  // /invite command
  new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get an invite link to add the bot to your server')
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),
  
  // /ping command
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s responsiveness')
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),
  
  // /version command
  new SlashCommandBuilder()
    .setName('version')
    .setDescription('Show the current version of the medication bot')
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),

  // /timezone command
  new SlashCommandBuilder()
    .setName('timezone')
    .setDescription('Set your timezone for accurate reminders')
    .addStringOption(option =>
      option
        .setName('timezone')
        .setDescription('Your timezone (e.g., America/New_York, Europe/London)')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),

  // /github command
  new SlashCommandBuilder()
    .setName('github')
    .setDescription('Get the GitHub repository link for the medication bot')
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),

  // /help command
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help information about the medication bot')
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),
].map(command => {
  const json = command.toJSON();
  // Set integration types for user-installable app
  json.integration_types = [0, 1];
  json.contexts = [0, 1, 2];
  return json;
});

export async function registerCommands(client: Client): Promise<void> {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

    console.log('[DEBUG] 🔃 Started refreshing application (/) commands');

    await rest.put(
      Routes.applicationCommands(client.user!.id),
      { body: commands }
    );

    console.log('[DEBUG] ✅ Successfully registered commands');
    console.log('[DEBUG] ℹ️  Integration Types: GUILD_INSTALL (0), USER_INSTALL (1)');
    console.log('[DEBUG] ℹ️  Contexts: GUILD (0), BOT_DM (1), PRIVATE_CHANNEL (2)');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}