// src/pwa/src/pages/Welcome.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Bell, Smartphone, Check, MessageCircle } from 'lucide-react';
import { api } from '../services/api';

export default function Welcome() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleDiscordLogin = async () => {
    setIsLoading(true);
    try {
      const { url } = await api.getDiscordAuthUrl();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to get Discord auth URL:', error);
      alert('Failed to initiate Discord login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-primary-500 rounded-full mb-6">
            <Pill className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Never Miss Your Medication
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Smart reminders for your health. Get notified on your phone, desktop, and Discord.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Smart Reminders
            </h3>
            <p className="text-gray-600">
              Get timely notifications across all your devices when it's time to take your medication.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Discord Integration
            </h3>
            <p className="text-gray-600">
              Receive reminders directly in Discord DMs. Manage medications with simple commands.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Track Progress
            </h3>
            <p className="text-gray-600">
              Mark medications as taken and keep track of your daily medication schedule.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold px-12 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 mx-auto"
          >
            <MessageCircle className="w-6 h-6" />
            {isLoading ? 'Connecting to Discord...' : 'Login with Discord'}
          </button>
          <p className="text-gray-500 mt-4">
            Secure OAuth authentication • Free forever
          </p>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Why Discord?</h3>
            <p className="text-blue-800 text-sm">
              We use Discord for secure authentication and to send you medication reminders directly in your DMs. 
              You'll also be able to manage medications using Discord commands from anywhere.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}