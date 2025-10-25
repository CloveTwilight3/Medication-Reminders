/** src/pwa/src/pages/AuthBot.tsx
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import { useNavigate } from 'react-router-dom';
import { Bot, ArrowLeft, User, Server } from 'lucide-react';

const DISCORD_CLIENT_ID = '1428768597949550644';

export default function AuthBot() {
  const navigate = useNavigate();

  const handleUserInstall = () => {
    window.location.href = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&integration_type=1&scope=applications.commands`;
  };

  const handleServerInstall = () => {
    window.location.href = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=bot%20applications.commands&permissions=2048`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-primary-400 hover:text-primary-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-primary-600/20 border border-primary-500 rounded-full mb-6">
            <Bot className="w-16 h-16 text-primary-400" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Add Cuddle Blahaj Medications Bot
          </h1>
          <p className="text-gray-400 mb-6">
            Get medication reminders directly in Discord
          </p>
        </div>

        {/* Installation Options */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleUserInstall}
            className="group p-6 bg-gray-900 border-2 border-primary-500 rounded-xl hover:bg-primary-900/30 transition-all"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary-600/20 border border-primary-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">User Install</h3>
              <p className="text-sm text-gray-400 mb-4">
                ✨ Recommended for personal use
              </p>
              <ul className="text-xs text-gray-500 text-left space-y-1">
                <li>✓ Works everywhere you go</li>
                <li>✓ Available in all servers & DMs</li>
                <li>✓ No server required</li>
                <li>✓ Personal and portable</li>
              </ul>
            </div>
          </button>

          <button
            onClick={handleServerInstall}
            className="group p-6 bg-gray-900 border-2 border-gray-600 rounded-xl hover:border-gray-500 hover:bg-gray-800 transition-all"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Server className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Server Install</h3>
              <p className="text-sm text-gray-400 mb-4">
                Traditional bot installation
              </p>
              <ul className="text-xs text-gray-500 text-left space-y-1">
                <li>✓ Add to specific server</li>
                <li>✓ Available to all members</li>
                <li>✓ Requires server permissions</li>
                <li>✓ Server-based access</li>
              </ul>
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/30 border border-blue-600 rounded-xl p-4 mb-6">
          <p className="text-blue-200 text-sm">
            <strong className="text-blue-300">💡 Tip:</strong> User install is recommended for personal medication tracking. 
            Your reminders will work in any server or DM without needing to add the bot to each server.
          </p>
        </div>

        <div className="pt-6 border-t border-gray-700">
          <h3 className="font-semibold text-white mb-3 text-center">After Installation:</h3>
          <ol className="text-sm text-gray-300 space-y-2">
            <li className="flex gap-2">
              <span className="font-semibold text-primary-400">1.</span>
              <span>Complete the Discord authorization</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary-400">2.</span>
              <span>Log in to this website with your Discord account</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary-400">3.</span>
              <span>Add your medications and receive reminders!</span>
            </li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Cuddle Blahaj Medications • Version PTB v1.1.0
          </p>
        </div>
      </div>
    </div>
  );
}