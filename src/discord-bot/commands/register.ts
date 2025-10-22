// src/discord-bot/commands/register.ts - V2.5 with /dashboard
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
              { name: 'Monthly', value: 'monthly' }
            )
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
              { name: 'Monthly', value: 'monthly' }
            )
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

  // /dashboard command - NEW!
  new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('Open the web dashboard to manage your medications')
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),

  // /timezone command (unchanged)
  new SlashCommandBuilder()
    .setName('timezone')
    .setDescription('Set your timezone for accurate reminders')
    .addStringOption(option =>
      option
        .setName('timezone')
        .setDescription('Your timezone (e.g., America/New_York, Europe/London)')
        .setRequired(true)
    )
    .setDMPermission(true)
    .setDefaultMemberPermissions(null),

  // /help command (unchanged)
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

    console.log('Started refreshing application (/) commands for V2.5 (subcommands + dashboard).');

    await rest.put(
      Routes.applicationCommands(client.user!.id),
      { body: commands }
    );

    console.log('✅ Successfully registered V2.5 commands with subcommands and /dashboard.');
    console.log('ℹ️  Integration Types: GUILD_INSTALL (0), USER_INSTALL (1)');
    console.log('ℹ️  Contexts: GUILD (0), BOT_DM (1), PRIVATE_CHANNEL (2)');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}