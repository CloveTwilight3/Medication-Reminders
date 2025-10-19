// src/pwa/src/pages/LinkDiscord.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../contexts/UserContext';

export default function LinkDiscord() {
  const { uid, user } = useUser();
  const navigate = useNavigate();
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (user?.discordId) {
      // Already linked
      navigate('/dashboard');
      return;
    }
    generateLinkCode();
  }, []);

  useEffect(() => {
    if (!linkCode) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          generateLinkCode(); // Auto-regenerate when expired
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [linkCode]);

  const generateLinkCode = async () => {
    if (!uid) return;

    setIsLoading(true);
    try {
      const { code } = await api.generateLinkCode(uid);
      setLinkCode(code);
      setTimeLeft(600);
    } catch (error) {
      console.error('Failed to generate link code:', error);
      alert('Failed to generate link code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (linkCode) {
      navigator.clipboard.writeText(linkCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Link Discord Account</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Connect your Discord account to receive medication reminders through Discord DMs.
          </p>

          {/* Instructions */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-8">
            <h2 className="font-semibold text-primary-900 mb-4">How to link:</h2>
            <ol className="space-y-3 text-primary-800">
              <li className="flex gap-3">
                <span className="font-bold">1.</span>
                <span>Copy the code below</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">2.</span>
                <span>Open Discord and find the Medication Reminder bot</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">3.</span>
                <span>
                  Type <code className="bg-white px-2 py-1 rounded text-sm">/link code:YOUR_CODE</code>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">4.</span>
                <span>Your accounts will be linked!</span>
              </li>
            </ol>
          </div>

          {/* Link Code Display */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Generating link code...</p>
            </div>
          ) : linkCode ? (
            <div className="space-y-4">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Your Link Code:</p>
                <div className="text-5xl font-mono font-bold text-primary-600 tracking-wider mb-4">
                  {linkCode}
                </div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>

              {/* Timer */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Code expires in{' '}
                  <span className="font-mono font-semibold text-primary-600">
                    {formatTime(timeLeft)}
                  </span>
                </p>
              </div>

              {/* Regenerate Button */}
              <div className="text-center">
                <button
                  onClick={generateLinkCode}
                  disabled={isLoading}
                  className="text-primary-600 hover:text-primary-700 font-medium underline disabled:opacity-50"
                >
                  Generate New Code
                </button>
              </div>
            </div>
          ) : null}

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Don't have the Discord bot?</strong> Add it to your server first, then come back here to link your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}