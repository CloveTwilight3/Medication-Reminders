/** src/pwa/src/pages/PrivacyPolicy.tsx
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

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
            <div>
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
              <p className="text-sm text-gray-400">Cuddle Blahaj Medications</p>
            </div>
          </div>

          <p className="text-gray-400 mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                This Privacy Policy explains how Cuddle Blahaj Medications ("we", "us", or "the Service") collects, uses, discloses, and safeguards your information when you use our medication reminder service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">2.1 Discord Account Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Discord user ID (for authentication)</li>
                    <li>Username (for display purposes)</li>
                    <li>Avatar (optional, for profile display)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">2.2 Medication Information</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Medication names</li>
                    <li>Scheduled reminder times</li>
                    <li>Dosage information (optional)</li>
                    <li>Medication instructions (optional)</li>
                    <li>Taken/not taken status</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">2.3 Settings & Preferences</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Timezone preference</li>
                    <li>Notification preferences (browser notifications on/off)</li>
                    <li>Session tokens (for authentication)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-3">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide medication reminders at scheduled times</li>
                <li>Send notifications via Discord DMs and browser notifications</li>
                <li>Maintain your user session and authentication</li>
                <li>Track medication status (taken/not taken)</li>
                <li>Sync data in real-time across devices</li>
                <li>Improve our service and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Data Storage and Security</h2>
              <p className="leading-relaxed mb-3">
                Your data is stored securely:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Database:</strong> SQLite database with appropriate access controls</li>
                <li><strong className="text-white">Encryption:</strong> HTTPS for all data transmission</li>
                <li><strong className="text-white">Authentication:</strong> Secure OAuth 2.0 via Discord</li>
                <li><strong className="text-white">Session Management:</strong> HTTP-only cookies with expiration</li>
                <li><strong className="text-white">Access Control:</strong> User data is isolated and protected</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Sharing and Disclosure</h2>
              <p className="leading-relaxed mb-3">
                We do NOT sell, trade, or rent your personal information. We may share information only in these circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">With Your Consent:</strong> When you explicitly authorize sharing</li>
                <li><strong className="text-white">Legal Requirements:</strong> If required by law or legal process</li>
                <li><strong className="text-white">Service Protection:</strong> To protect our rights, privacy, safety, or property</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your data for as long as your account is active. You may delete your account and all associated data at any time through the application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights</h2>
              <p className="leading-relaxed mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Access:</strong> View all your stored data</li>
                <li><strong className="text-white">Correct:</strong> Update or modify your information</li>
                <li><strong className="text-white">Delete:</strong> Remove your account and all data</li>
                <li><strong className="text-white">Export:</strong> Request a copy of your data (via dashboard)</li>
                <li><strong className="text-white">Opt-out:</strong> Disable notifications at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Third-Party Services</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  We use the following third-party services:
                </p>
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-2">Discord</h3>
                  <p className="text-sm">
                    Used for authentication (OAuth 2.0) and sending reminder notifications. Subject to{' '}
                    <a 
                      href="https://discord.com/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 underline"
                    >
                      Discord's Privacy Policy
                    </a>.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Cookies and Local Storage</h2>
              <p className="leading-relaxed mb-3">We use:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Session Cookies:</strong> For authentication (HTTP-only, secure)</li>
                <li><strong className="text-white">WebSocket Token:</strong> For real-time synchronization</li>
                <li><strong className="text-white">Local Storage:</strong> For notification preferences and modal states</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Children's Privacy</h2>
              <p className="leading-relaxed">
                Cuddle Blahaj Medications is not intended for use by children under 13. We do not knowingly collect information from children under 13. If you believe a child has provided us with information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify users of material changes by updating the "Last Updated" date. Continued use of the Service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy, please contact us through our{' '}
                <a 
                  href="https://github.com/clovetwilight3/cuddle-blahaj-medication" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 underline"
                >
                  GitHub repository
                </a>{' '}
                or Discord support server.
              </p>
            </section>

            <section className="bg-green-900/30 border border-green-600 rounded-lg p-6">
              <p className="text-green-300 font-semibold mb-2">✅ Your Privacy Matters</p>
              <p className="text-green-200 text-sm leading-relaxed">
                Cuddle Blahaj Medications is committed to protecting your privacy. We only collect data necessary to provide the service, we never sell your data, and you have full control to delete your information at any time.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}