// src/discord-bot/commands/register.ts
import { Client, REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
  new SlashCommandBuilder()
    .setName('addmed')
    .setDescription('Add a daily medication reminder')
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
    ),

  new SlashCommandBuilder()
    .setName('listmeds')
    .setDescription('List all your scheduled medications'),

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
    .setName('webconnect')
    .setDescription('Get a link to connect this Discord account to the web app'),

  new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your Discord account using a code from the web app')
    .addStringOption(option =>
      option
        .setName('code')
        .setDescription('6-character link code from the web app (e.g., ABC123)')
        .setRequired(true)
        .setMinLength(6)
        .setMaxLength(6)
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