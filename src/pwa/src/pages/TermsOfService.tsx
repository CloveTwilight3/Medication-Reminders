// src/pwa/src/pages/TermsOfService.tsx
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>

          <p className="text-gray-600 mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using the Medication Reminder service ("Service"), you agree to be bound by these
                Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="leading-relaxed mb-3">
                Medication Reminder is a free service that helps users remember to take their medications through
                reminders sent via Discord direct messages and web notifications. The Service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Web application for managing medication schedules</li>
                <li>Discord bot integration for reminders and commands</li>
                <li>Medication tracking and status updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Account Security</h3>
              <p className="leading-relaxed mb-4">
                You are responsible for maintaining the security of your Discord account. Any activity that occurs
                through your account is your responsibility.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Accurate Information</h3>
              <p className="leading-relaxed mb-4">
                You agree to provide accurate medication information and reminder times. You are responsible for
                ensuring the information you enter is correct.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Appropriate Use</h3>
              <p className="leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Medical Disclaimer</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800 font-semibold mb-2">IMPORTANT HEALTH NOTICE</p>
                <p className="text-yellow-700 leading-relaxed">
                  This Service is a reminder tool only and is NOT a substitute for professional medical advice,
                  diagnosis, or treatment. Always seek the advice of your physician or other qualified health
                  provider with any questions regarding your medication or health condition.
                </p>
              </div>
              <p className="leading-relaxed mb-3">You acknowledge and agree that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The Service does not provide medical advice or healthcare services</li>
                <li>Reminders are provided on a best-effort basis and may not always be delivered</li>
                <li>You are solely responsible for taking your medications as prescribed by your healthcare provider</li>
                <li>Technical issues, service outages, or user error may result in missed reminders</li>
                <li>We are not responsible for any health consequences resulting from missed doses</li>
                <li>You should always follow your healthcare provider's instructions regarding medication</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Service Availability</h2>
              <p className="leading-relaxed mb-3">
                We strive to provide reliable service but cannot guarantee uninterrupted availability. The Service
                may be temporarily unavailable due to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Scheduled or emergency maintenance</li>
                <li>Technical difficulties or failures</li>
                <li>Issues with Discord's platform</li>
                <li>Circumstances beyond our reasonable control</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="leading-relaxed mb-3">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or use</li>
                <li>Health-related consequences from missed medication doses</li>
                <li>Damages resulting from service interruptions or errors</li>
                <li>Any claims arising from your use of or inability to use the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disclaimer of Warranties</h2>
              <p className="leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
                OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE,
                OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="leading-relaxed mb-3">
                The Service is provided under the MIT License. The source code is available on GitHub. You may:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use, copy, modify, merge, publish, and distribute the software</li>
                <li>Use the software for personal or commercial purposes</li>
              </ul>
              <p className="mt-3 leading-relaxed">
                However, Discord's trademarks, logos, and branding are property of Discord Inc. and are used in
                accordance with Discord's branding guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Services</h2>
              <p className="leading-relaxed mb-3">
                The Service integrates with Discord. Your use of Discord is subject to Discord's Terms of Service
                and Privacy Policy. We are not responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Discord's availability or reliability</li>
                <li>Changes to Discord's API or services</li>
                <li>Discord's handling of your data</li>
                <li>Any issues arising from your Discord account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Data and Privacy</h2>
              <p className="leading-relaxed">
                Your use of the Service is also governed by our Privacy Policy. We collect and process your data
                as described in the Privacy Policy. By using the Service, you consent to such collection and processing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Termination</h2>
              <p className="leading-relaxed mb-3">
                You may terminate your use of the Service at any time by:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Logging out and discontinuing use</li>
                <li>Deleting all your medications</li>
                <li>Disconnecting your Discord account</li>
              </ul>
              <p className="leading-relaxed">
                We reserve the right to suspend or terminate your access to the Service at any time, with or without
                cause, including for violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="leading-relaxed">
                We may modify these Terms at any time. Continued use of the Service after changes constitutes
                acceptance of the modified Terms. We will update the "Last Updated" date when changes are made.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard
                to conflict of law provisions. Any disputes shall be resolved in accordance with applicable jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Severability</h2>
              <p className="leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be
                limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain
                in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="leading-relaxed">
                For questions about these Terms, please contact us through our GitHub repository or Discord server.
              </p>
            </section>

            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-900 font-semibold mb-2">Summary (Not Legal Advice)</p>
              <p className="text-blue-800 text-sm leading-relaxed">
                This is a free reminder service provided as-is. It's a tool to help you remember medications, but
                you're responsible for actually taking them. We're not liable if reminders fail or if you miss doses.
                Always follow your doctor's instructions. We use Discord for authentication and reminders, so you
                need to follow their rules too. We can change or shut down the service anytime. By using this, you
                agree to these terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}