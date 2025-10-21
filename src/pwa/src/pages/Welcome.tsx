// src/pwa/src/pages/Welcome.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill, Bell, MessageCircle, Check, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function Welcome() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDiscordLogin = async () => {
    setIsLoading(true);
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('Detected timezone:', detectedTimezone);

      const { url } = await api.getDiscordAuthUrl(detectedTimezone);
      window.location.href = url;
    } catch (error) {
      console.error('Failed to get Discord auth URL:', error);
      alert('Failed to initiate Discord login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-primary-600 rounded-full mb-6 shadow-lg">
            <Pill className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Never Miss Your Medication
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Smart reminders for your health. Get notified on your phone, desktop, and Discord.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-900/40 border border-green-600 rounded-full text-sm text-green-300">
            <Check className="w-4 h-4" />
            Version 2.0 - Now with frequency options and timezone support!
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-primary-500 transition-all">
            <div className="w-12 h-12 bg-primary-600/20 border border-primary-500 rounded-lg flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Smart Reminders
            </h3>
            <p className="text-sm text-gray-400">
              Timely notifications across all your devices when it's time for your medication.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-primary-500 transition-all">
            <div className="w-12 h-12 bg-primary-600/20 border border-primary-500 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Multiple Frequencies
            </h3>
            <p className="text-sm text-gray-400">
              Daily, every 2 days, weekly, bi-weekly, or monthly medication schedules.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-primary-500 transition-all">
            <div className="w-12 h-12 bg-primary-600/20 border border-primary-500 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Discord Integration
            </h3>
            <p className="text-sm text-gray-400">
              Receive reminders in Discord DMs. Manage medications with simple commands.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-primary-500 transition-all">
            <div className="w-12 h-12 bg-primary-600/20 border border-primary-500 rounded-lg flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Detailed Tracking
            </h3>
            <p className="text-sm text-gray-400">
              Add dose, amount, and instructions. Track your medication progress.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-12 py-4 rounded-full text-lg shadow-2xl hover:shadow-primary-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 mx-auto"
          >
            <MessageCircle className="w-6 h-6" />
            {isLoading ? 'Connecting to Discord...' : 'Login with Discord'}
          </button>
          <p className="text-gray-400 mt-4">
            Secure OAuth authentication • Free forever • Your timezone will be auto-detected
          </p>
          <p className="text-sm text-gray-500 mt-2">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-primary-400 hover:text-primary-300 underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-400 hover:text-primary-300 underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* What's New in V2 */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-primary-900/40 to-blue-900/40 border border-primary-600 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-primary-300 mb-4 flex items-center gap-2">
              <Check className="w-6 h-6" />
              What's New in Version 2.0
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-primary-400 mt-1">✓</span>
                <span><strong className="text-white">Multiple Frequency Options:</strong> Daily, every 2 days, weekly, bi-weekly, and monthly schedules</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-400 mt-1">✓</span>
                <span><strong className="text-white">Timezone Support:</strong> Automatic timezone detection with manual override option</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-400 mt-1">✓</span>
                <span><strong className="text-white">Medication Details:</strong> Add optional dose, amount, and special instructions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-400 mt-1">✓</span>
                <span><strong className="text-white">Edit Medications:</strong> Update time, frequency, and details without deleting</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-400 mt-1">✓</span>
                <span><strong className="text-white">Better Discord Commands:</strong> New /editmed and /timezone commands</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Links */}
        <footer className="mt-16 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <Link to="/terms" className="hover:text-primary-400 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-primary-400 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <a 
              href="https://github.com/clovetwilight3/medication-reminders" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary-400 transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <span className="text-primary-400 font-semibold">v2.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}