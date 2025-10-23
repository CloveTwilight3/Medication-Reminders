/** src/pwa/src/services/notificationService.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Check if notifications are supported in this browser
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notifications are not supported in this browser');
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  /**
   * Show a notification
   */
  async showNotification(
    title: string,
    options?: {
      body?: string;
      icon?: string;
      badge?: string;
      tag?: string;
      requireInteraction?: boolean;
      silent?: boolean;
      data?: any;
    }
  ): Promise<void> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return;
    }

    const permission = this.getPermissionStatus();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: options?.icon || '/pwa-192x192.png',
        badge: options?.badge || '/favicon.ico',
        ...options,
      });

      // Auto-close after 10 seconds if not requireInteraction
      if (!options?.requireInteraction) {
        setTimeout(() => notification.close(), 10000);
      }

      // Optional: Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Show a medication reminder notification
   */
  async showMedicationReminder(
    medicationName: string,
    time: string,
    additionalInfo?: string
  ): Promise<void> {
    const body = additionalInfo 
      ? `Time: ${time}\n${additionalInfo}`
      : `Time to take your medication at ${time}`;

    await this.showNotification(`💊 ${medicationName}`, {
      body,
      tag: `medication-${medicationName}`,
      requireInteraction: true, // Keep notification visible until user interacts
      data: { medicationName, time }
    });
  }

  /**
   * Check if user has enabled notifications in localStorage
   */
  areNotificationsEnabled(): boolean {
    const enabled = localStorage.getItem('notifications_enabled');
    return enabled === 'true';
  }

  /**
   * Save notification preference to localStorage
   */
  setNotificationsEnabled(enabled: boolean): void {
    localStorage.setItem('notifications_enabled', enabled.toString());
  }
}

export const notificationService = NotificationService.getInstance();