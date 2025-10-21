// src/pwa/src/pages/AuthBot.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, CheckCircle, ArrowLeft } from 'lucide-react';

const DISCORD_CLIENT_ID = '1428768597949550644';
const BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=2048&scope=bot+applications.commands`;

export default function AuthBot() {
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Auto-redirect after a short delay to show the info
    const timer = setTimeout(() => {
      setRedirecting(true);
      window.location.href = BOT_INVITE_URL;
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualRedirect = () => {
    setRedirecting(true);
    window.location.href = BOT_INVITE_URL;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="text-center">
          <div className="inline-block p-4 bg-primary-100 rounded-full mb-6">
            <Bot className="w-16 h-16 text-primary-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Add Medication Bot to Your Server
          </h1>

          {redirecting ? (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
              <p className="text-gray-600 mb-4">
                Redirecting to Discord authorization...
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-8">
                You're about to authorize the Medication Reminder bot to join your Discord server.
                The bot will be able to:
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Bot Permissions & Features
                </h3>
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Send Direct Messages:</strong> Send medication reminders to users via DM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Slash Commands:</strong> Use commands like /addmed, /listmeds, /removemed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Interactive Buttons:</strong> Mark medications as taken with button clicks</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 text-left">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> The bot needs to be in a server, but all medication reminders 
                  are sent via <strong>Direct Messages</strong>. Server members won't see your personal 
                  medication information.
                </p>
              </div>

              <p className="text-gray-500 text-sm mb-6">
                Redirecting automatically in a moment, or click the button below...
              </p>

              <button
                onClick={handleManualRedirect}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
              >
                <Bot className="w-6 h-6" />
                Add Bot to Discord Server
              </button>
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">After Adding the Bot:</h3>
          <ol className="text-sm text-gray-600 space-y-2">
            <li className="flex gap-2">
              <span className="font-semibold text-primary-600">1.</span>
              <span>Select a server where you have "Manage Server" permission</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary-600">2.</span>
              <span>Authorize the bot with the requested permissions</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary-600">3.</span>
              <span>Log in to this website with your Discord account</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary-600">4.</span>
              <span>Add medications and start receiving reminders!</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}