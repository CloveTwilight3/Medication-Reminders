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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once('clientReady', async () => {
  console.log(`✅ Bot is ready! Logged in as ${client.user?.tag}`);
  
  // Register slash commands
  await registerCommands(client);
  
  // Setup medication scheduler
  setupScheduler(client);
});

// Handle interactions (slash commands and buttons)
client.on('interactionCreate', async (interaction) => {
  await handleInteraction(interaction, client);
});

client.login(process.env.DISCORD_TOKEN);