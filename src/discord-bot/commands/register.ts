// src/discord-bot/commands/register.ts
import { Client, REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
  new SlashCommandBuilder()
    .setName('addmed')
    .setDescription('Add a medication reminder')
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
        .setDescription('Dose amount (e.g., "10mg", "2 tablets") - Optional')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('amount')
        .setDescription('Amount to take (e.g., "1 pill", "5ml") - Optional')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('instructions')
        .setDescription('Special instructions (e.g., "Take with food") - Optional')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('listmeds')
    .setDescription('List all your scheduled medications'),

  new SlashCommandBuilder()
    .setName('editmed')
    .setDescription('Edit an existing medication (cannot change name)')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Name of the medication to edit')
        .setRequired(true)
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
    ),

  new SlashCommandBuilder()
    .setName('removemed')
    .setDescription('Remove a medication reminder')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Name of the medication to remove')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('timezone')
    .setDescription('Set your timezone for accurate reminders')
    .addStringOption(option =>
      option
        .setName('timezone')
        .setDescription('Your timezone (e.g., America/New_York, Europe/London)')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help information about the medication bot'),
].map(command => command.toJSON());

export async function registerCommands(client: Client): Promise<void> {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(client.user!.id),
      { body: commands }
    );

    console.log('✅ Successfully registered application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}