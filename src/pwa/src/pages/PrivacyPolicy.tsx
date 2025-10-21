// src/pwa/src/pages/PrivacyPolicy.tsx
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-400 hover:text-primary-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary-600/20 border border-primary-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          </div>

          <p className="text-gray-400 mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our medication reminder service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Discord Account Information:</strong> Discord user ID, username, and avatar</li>
                <li><strong className="text-white">Medication Information:</strong> Names of medications and reminder times</li>
                <li><strong className="text-white">Timezone:</strong> Your timezone for accurate reminders</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="leading-relaxed">
                We use your information to provide medication reminders, maintain your session, and improve our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Storage and Security</h2>
              <p className="leading-relaxed">
                Your data is stored on secure servers. We implement appropriate technical measures to protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
              <p className="leading-relaxed">
                You have the right to access, correct, or delete your data at any time through the application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy, please contact us through our GitHub repository or Discord server.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}