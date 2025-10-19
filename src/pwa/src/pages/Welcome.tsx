// src/pwa/src/pages/Welcome.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Bell, Smartphone, Check } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../contexts/UserContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [isCreating, setIsCreating] = useState(false);

  const handleGetStarted = async () => {
    setIsCreating(true);
    try {
      const user = await api.createUser();
      setUser(user.uid, user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create account. Please try again.');
    } finally {
      setIsCreating(false);
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
              <Smartphone className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Works Everywhere
            </h3>
            <p className="text-gray-600">
              Use on your phone, desktop, or Discord. Your medications sync across all platforms.
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
            onClick={handleGetStarted}
            disabled={isCreating}
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-12 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isCreating ? 'Creating Account...' : 'Get Started Free'}
          </button>
          <p className="text-gray-500 mt-4">
            No signup required • Works offline • Free forever
          </p>
        </div>

        {/* Connect Option */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Already using Discord bot?
          </p>
          <button
            onClick={() => navigate('/connect')}
            className="text-primary-600 hover:text-primary-700 font-medium underline"
          >
            Connect your Discord account
          </button>
        </div>
      </div>
    </div>
  );
}