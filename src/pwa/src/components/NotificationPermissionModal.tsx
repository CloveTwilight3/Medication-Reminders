/** src/pwa/src/components/NotificationPermissionModal.tsx
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import { Bell, X } from 'lucide-react';

interface NotificationPermissionModalProps {
  onAllow: () => void;
  onDeny: () => void;
  onClose: () => void;
}

export default function NotificationPermissionModal({
  onAllow,
  onDeny,
  onClose
}: NotificationPermissionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary-600/20 border border-primary-500 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-primary-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Enable Notifications
          </h2>

          <p className="text-gray-300 mb-6 leading-relaxed">
            Stay on top of your medication schedule with timely reminders. 
            We'll send you a notification when it's time to take your medication.
          </p>

          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-6 w-full">
            <p className="text-blue-200 text-sm">
              <strong className="text-blue-300">💡 Note:</strong> You can change this setting anytime in your dashboard settings.
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onDeny}
              className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Not Now
            </button>
            <button
              onClick={onAllow}
              className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Allow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}