/** src/pwa/src/services/notificationService.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {
    // Log notification support on initialization
    console.log('🔔 NotificationService initialized');
    console.log('🔔 Notifications supported:', this.isSupported());
    console.log('🔔 Current permission:', this.getPermissionStatus());
  }

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
    const supported = 'Notification' in window;
    if (!supported) {
      console.warn('🔔 Notifications are not supported in this browser');
    }
    return supported;
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
      console.log('🔔 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission result:', permission);
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted!');
      } else if (permission === 'denied') {
        console.warn('❌ Notification permission denied');
      } else {
        console.log('⏸️ Notification permission dismissed');
      }
      
      return permission;
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      throw error;
    }
  }

  /**
   * Show a notification with improved error handling
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
    console.log('🔔 Attempting to show notification:', title);
    
    if (!this.isSupported()) {
      console.warn('❌ Cannot show notification: Not supported in this browser');
      return;
    }

    const permission = this.getPermissionStatus();
    console.log('🔔 Current permission status:', permission);
    
    if (permission !== 'granted') {
      console.warn('❌ Cannot show notification: Permission not granted (current:', permission, ')');
      return;
    }

    // Check if notifications are enabled in localStorage
    if (!this.areNotificationsEnabled()) {
      console.log('⏸️ Notifications disabled by user preference');
      return;
    }

    try {
      console.log('🔔 Creating notification with options:', options);
      
      const notification = new Notification(title, {
        icon: options?.icon || '/pwa-192x192.png',
        badge: options?.badge || '/favicon.ico',
        ...options,
      });

      console.log('✅ Notification created successfully');

      // Auto-close after 10 seconds if not requireInteraction
      if (!options?.requireInteraction) {
        setTimeout(() => {
          console.log('🔔 Auto-closing notification:', title);
          notification.close();
        }, 10000);
      }

      // Handle notification click
      notification.onclick = () => {
        console.log('🔔 Notification clicked:', title);
        window.focus();
        notification.close();
      };

      // Handle notification errors
      notification.onerror = (error) => {
        console.error('❌ Notification error:', error);
      };

      // Handle notification close
      notification.onclose = () => {
        console.log('🔔 Notification closed:', title);
      };

      // Handle notification show
      notification.onshow = () => {
        console.log('✅ Notification shown:', title);
      };

    } catch (error) {
      console.error('❌ Error showing notification:', error);
      
      // Provide helpful error message
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          console.error('💡 Tip: Check notification permissions in browser settings');
        }
      }
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
    console.log('💊 Showing medication reminder:', medicationName, 'at', time);
    
    const body = additionalInfo 
      ? `Time: ${time}\n${additionalInfo}`
      : `Time to take your medication at ${time}`;

    await this.showNotification(`💊 ${medicationName}`, {
      body,
      tag: `medication-${medicationName}`,
      requireInteraction: true, // Keep notification visible until user interacts
      data: { medicationName, time },
      icon: '/pwa-192x192.png',
      badge: '/favicon.ico'
    });
  }

  /**
   * Check if user has enabled notifications in localStorage
   */
  areNotificationsEnabled(): boolean {
    const enabled = localStorage.getItem('notifications_enabled');
    const result = enabled === 'true';
    console.log('🔔 Notifications enabled in localStorage:', result);
    return result;
  }

  /**
   * Save notification preference to localStorage
   */
  setNotificationsEnabled(enabled: boolean): void {
    console.log('🔔 Setting notifications enabled:', enabled);
    localStorage.setItem('notifications_enabled', enabled.toString());
  }

  /**
   * Test notification - useful for debugging
   */
  async testNotification(): Promise<void> {
    console.log('🔔 Testing notification system...');
    await this.showNotification('Test Notification', {
      body: 'If you see this, notifications are working! 🎉',
      requireInteraction: false,
      tag: 'test-notification'
    });
  }
}

export const notificationService = NotificationService.getInstance();