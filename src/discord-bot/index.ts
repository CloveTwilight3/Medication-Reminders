/** src/discord-bot/index.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import { registerCommands } from './commands/register';
import { handleInteraction } from './handlers/interactionHandler';
import { setupScheduler } from './services/scheduler';

dotenv.config();

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

console.log('[DEBUG] 🔃 Starting loading bot');
console.log('[DEBUG] Environment variables:');
console.log('BOT_TOKEN:', TOKEN ? '✓ Set' : '✗ Not set');
console.log('CLIENT_ID:', CLIENT_ID ? '✓ Set' : '✗ Not set');
console.log('GUILD_ID:', GUILD_ID ? '✓ Set (optional)' : '✗ Not set (optional)');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once('clientReady', async () => {
  console.log(`[DEBUG] ✅ Bot is ready! Logged in as ${client.user?.tag}`);
  
  // Register slash commands
  await registerCommands(client);
  
  // Setup medication scheduler
  setupScheduler(client);
});

// Handle interactions (slash commands and buttons)
client.on('interactionCreate', async (interaction) => {
  await handleInteraction(interaction, client);
});

client.login(TOKEN).catch(err => {
  console.error('[ERROR] ❌ Failed to login:', err);
} );