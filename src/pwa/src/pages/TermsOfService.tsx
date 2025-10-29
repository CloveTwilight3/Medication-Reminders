/** src/pwa/src/pages/TermsOfService.tsx
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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
            <div>
              <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
              <p className="text-sm text-gray-400">Cuddle Blahaj Medications</p>
            </div>
          </div>

          <p className="text-gray-400 mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using the Cuddle Blahaj Medications service ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these Terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="leading-relaxed mb-3">
                Cuddle Blahaj Medications is a free medication reminder service that helps users remember to take their medications through reminders sent via Discord direct messages, browser notifications, and web dashboard.
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
                  This Service is a reminder tool only and is NOT a substitute for professional medical advice. Always seek the advice of your physician regarding your medication or health condition. Cuddle Blahaj Medications does not provide medical advice, diagnosis, or treatment.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. No Warranties</h2>
              <p className="leading-relaxed">
                The Service is provided "AS IS" without warranty of any kind. We do not guarantee that reminders will always be delivered on time or that the Service will be uninterrupted or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Limitation of Liability</h2>
              <p className="leading-relaxed mb-3">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY indirect, incidental, special, consequential, or punitive damages, including health-related consequences from missed medication doses.
              </p>
              <p className="leading-relaxed">
                You acknowledge that Cuddle Blahaj Medications is a reminder tool and that you are solely responsible for taking your medications as prescribed by your healthcare provider.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Privacy</h2>
              <p className="leading-relaxed">
                Your use of the Service is also governed by our <Link to="/privacy" className="text-primary-400 hover:text-primary-300 underline">Privacy Policy</Link>. Please review it to understand how we collect and use your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating the "Last Updated" date. Your continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Termination</h2>
              <p className="leading-relaxed">
                You may stop using the Service at any time. We reserve the right to suspend or terminate your access to the Service at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Information</h2>
              <p className="leading-relaxed">
                For questions about these Terms, please contact us through our <a href="https://github.com/clovetwilight3/cuddle-blahaj-medication" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 underline">GitHub repository</a> or Discord support server.
              </p>
            </section>

            <section className="bg-blue-900/30 border border-blue-600 rounded-lg p-6">
              <p className="text-blue-300 font-semibold mb-2">Summary (Not Legal Advice)</p>
              <p className="text-blue-200 text-sm leading-relaxed">
                Cuddle Blahaj Medications is a free reminder service provided as-is. It's a tool to help you remember medications, but you're responsible for actually taking them. We're not liable if reminders fail or if you miss doses. Always follow your doctor's instructions. This is not medical advice.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}