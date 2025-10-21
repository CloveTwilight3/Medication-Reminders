// src/pwa/src/pages/PrivacyPolicy.tsx
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
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
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>

          <p className="text-gray-600 mb-8">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                Welcome to Medication Reminder ("we", "our", or "us"). This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you use our medication reminder service,
                including our web application and Discord bot.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Discord Account Information:</strong> When you log in with Discord, we receive your Discord user ID, username, and avatar from Discord's OAuth service.</li>
                <li><strong>Medication Information:</strong> Names of medications and reminder times you choose to set up.</li>
                <li><strong>Usage Data:</strong> Information about when you mark medications as taken or not taken.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Session Data:</strong> We use cookies to maintain your login session.</li>
                <li><strong>Log Data:</strong> Our servers automatically record information including your browser type, and access times for security and debugging purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain our medication reminder service</li>
                <li>Send you medication reminders via Discord direct messages</li>
                <li>Authenticate your identity and maintain your session</li>
                <li>Improve and optimize our service</li>
                <li>Communicate with you about service updates or issues</li>
                <li>Ensure the security and proper functioning of our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h2>
              <p className="leading-relaxed mb-3">
                Your data is stored on secure servers. We implement appropriate technical and organizational
                measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p className="leading-relaxed">
                However, no method of transmission over the internet or electronic storage is completely secure.
                While we strive to protect your information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
              <p className="leading-relaxed mb-3">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Discord:</strong> We use Discord's OAuth service for authentication and send reminders through Discord's messaging service.</li>
                <li><strong>Legal Requirements:</strong> If required by law or to protect our rights, we may disclose your information to law enforcement or other authorities.</li>
                <li><strong>Service Providers:</strong> We may share data with trusted service providers who assist in operating our service, subject to confidentiality obligations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a structured format</li>
                <li><strong>Withdraw Consent:</strong> Disconnect your Discord account at any time</li>
              </ul>
              <p className="mt-3 leading-relaxed">
                To exercise these rights, please delete your medications through the app and log out. Your data will be removed from our systems.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide you services.
                If you delete your account, we will delete your personal information within 30 days, except where we
                are required to retain it for legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="leading-relaxed">
                Our service is not intended for users under the age of 13. We do not knowingly collect personal
                information from children under 13. If you are a parent or guardian and believe your child has
                provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="leading-relaxed">
                Your information may be transferred to and maintained on servers located outside of your state,
                province, country, or other governmental jurisdiction. By using our service, you consent to such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review
                this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Medical Disclaimer</h2>
              <p className="leading-relaxed">
                This service is a reminder tool only and is not a substitute for professional medical advice.
                Always consult with your healthcare provider regarding your medication regimen. We are not responsible
                for missed doses or any health-related consequences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us through
                our GitHub repository or Discord server.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}