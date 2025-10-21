// src/pwa/src/pages/TermsOfService.tsx
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
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
              <FileText className="w-6 h-6 text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          </div>

          <p className="text-gray-400 mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using the Medication Reminder service, you agree to be bound by these Terms of Service. If you do not agree to these Terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="leading-relaxed mb-3">
                Medication Reminder is a free service that helps users remember to take their medications through reminders sent via Discord direct messages and web notifications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Responsibilities</h2>
              <p className="leading-relaxed mb-3">You agree to provide accurate medication information and reminder times. You are responsible for ensuring the information you enter is correct.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Medical Disclaimer</h2>
              <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-4 mb-4">
                <p className="text-yellow-300 font-semibold mb-2">IMPORTANT HEALTH NOTICE</p>
                <p className="text-yellow-200 leading-relaxed">
                  This Service is a reminder tool only and is NOT a substitute for professional medical advice. Always seek the advice of your physician regarding your medication or health condition.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
              <p className="leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY indirect, incidental, special, consequential, or punitive damages, including health-related consequences from missed medication doses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Contact Information</h2>
              <p className="leading-relaxed">
                For questions about these Terms, please contact us through our GitHub repository or Discord server.
              </p>
            </section>

            <section className="bg-blue-900/30 border border-blue-600 rounded-lg p-6">
              <p className="text-blue-300 font-semibold mb-2">Summary (Not Legal Advice)</p>
              <p className="text-blue-200 text-sm leading-relaxed">
                This is a free reminder service provided as-is. It's a tool to help you remember medications, but you're responsible for actually taking them. We're not liable if reminders fail or if you miss doses. Always follow your doctor's instructions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}