/** src/pwa/src/pages/Dashboard.tsx
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pill, LogOut, Trash2, Check, Edit2, Settings, Clock, Wifi, WifiOff, Bell, BellOff, Volume2 } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { Medication, FrequencyType, FREQUENCY_OPTIONS, TIMEZONE_OPTIONS } from '../types';
import { notificationService } from '../services/notificationService';
import NotificationPermissionModal from '../components/NotificationPermissionModal';

export default function Dashboard() {
  const { uid, user, logout } = useUser();
  const navigate = useNavigate();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState(user?.timezone || 'UTC');
  
  // Notification states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState<FrequencyType>('daily');
  const [newMedCustomDays, setNewMedCustomDays] = useState<number | undefined>(undefined); // 🔥 NEW
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedAmount, setNewMedAmount] = useState('');
  const [newMedInstructions, setNewMedInstructions] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get session token from cookie for WebSocket
  const getSessionToken = () => {
     const cookies = document.cookie.split(';');
     const wsCookie = cookies.find(c => c.trim().startsWith('ws_token='));
     return wsCookie ? wsCookie.split('=')[1] : null;
  };

  // WebSocket connection
  const { isConnected, connectionStatus } = useWebSocket(getSessionToken(), {
    onMessage: (message) => {
      console.log('📨 Received WebSocket message:', message);
      
      // Only process messages for this user
      if (message.uid !== uid) return;

      switch (message.type) {
        case 'medication_added':
        case 'medication_updated':
          // Reload medications when any change occurs
          loadMedications();
          
          // Show notification if a medication was updated and is now due
          if (message.type === 'medication_updated' && message.data) {
            const med = message.data as Medication;
            console.log('💊 Medication updated:', med);
            
            // CRITICAL FIX: Check localStorage directly to avoid stale closure
            const currentlyEnabled = notificationService.areNotificationsEnabled();
            console.log('🔔 Current notification status from localStorage:', currentlyEnabled);
            
            if (!med.taken && currentlyEnabled) {
              console.log('🔔 Attempting to show notification for medication:', med.name);
              notificationService.showMedicationReminder(
                med.name,
                med.time,
                med.dose ? `Dose: ${med.dose}` : undefined
              ).catch(err => {
                console.error('❌ Failed to show notification:', err);
              });
            } else {
              console.log('⏸️ Not showing notification:', {
                taken: med.taken,
                notificationsEnabled: currentlyEnabled
              });
            }
          }
          break;
        case 'medication_deleted':
          loadMedications();
          break;
      }
    },
    onConnect: () => {
      console.log('✅ WebSocket connected!');
    },
    onDisconnect: () => {
      console.log('🔌 WebSocket disconnected');
    }
  });

  useEffect(() => {
    loadMedications();
    checkNotificationStatus();
    
    // CRITICAL FIX: Sync state with localStorage on mount
    const savedEnabled = notificationService.areNotificationsEnabled();
    setNotificationsEnabled(savedEnabled);
    console.log('🔔 Synced notification state from localStorage:', savedEnabled);
  }, [uid]);

  useEffect(() => {
    if (user) {
      setSelectedTimezone(user.timezone);
    }
  }, [user]);

  // Check notification permission status on mount
  const checkNotificationStatus = () => {
    if (!notificationService.isSupported()) {
      console.warn('⚠️ Notifications not supported in this browser');
      return;
    }

    const permission = notificationService.getPermissionStatus();
    setNotificationPermission(permission);
    console.log('🔔 Initial permission status:', permission);

    const enabled = notificationService.areNotificationsEnabled();
    setNotificationsEnabled(enabled);
    console.log('🔔 Notifications enabled:', enabled);

    // Show modal if user hasn't made a decision yet and hasn't seen the modal before
    const hasSeenModal = localStorage.getItem('notification_modal_seen');
    if (permission === 'default' && !hasSeenModal) {
      // Show modal after a short delay so user can see the dashboard first
      setTimeout(() => {
        setShowNotificationModal(true);
      }, 2000);
    }
  };

  const handleAllowNotifications = async () => {
    console.log('🔔 User clicked Allow Notifications');
    try {
      const permission = await notificationService.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        notificationService.setNotificationsEnabled(true);
        setNotificationsEnabled(true);
        
        // Show a test notification
        console.log('🔔 Showing test notification');
        await notificationService.showNotification(
          '🎉 Notifications Enabled!',
          {
            body: 'You\'ll now receive medication reminders',
            requireInteraction: false
          }
        );
      } else {
        console.warn('⚠️ Permission not granted:', permission);
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
    } finally {
      localStorage.setItem('notification_modal_seen', 'true');
      setShowNotificationModal(false);
    }
  };

  const handleDenyNotifications = () => {
    console.log('🔔 User clicked Deny Notifications');
    notificationService.setNotificationsEnabled(false);
    setNotificationsEnabled(false);
    localStorage.setItem('notification_modal_seen', 'true');
    setShowNotificationModal(false);
  };

  const handleToggleNotifications = async () => {
    console.log('🔔 Toggle notifications clicked. Current state:', notificationsEnabled);
    
    if (!notificationsEnabled) {
      // User wants to enable notifications
      if (notificationPermission === 'granted') {
        // Already have permission, just toggle
        notificationService.setNotificationsEnabled(true);
        setNotificationsEnabled(true);
        console.log('✅ Notifications enabled (already had permission)');
      } else if (notificationPermission === 'default') {
        // Need to request permission
        try {
          const permission = await notificationService.requestPermission();
          setNotificationPermission(permission);
          
          if (permission === 'granted') {
            notificationService.setNotificationsEnabled(true);
            setNotificationsEnabled(true);
            
            await notificationService.showNotification(
              '🎉 Notifications Enabled!',
              {
                body: 'You\'ll now receive medication reminders',
                requireInteraction: false
              }
            );
            console.log('✅ Notifications enabled (new permission granted)');
          }
        } catch (error) {
          console.error('❌ Error requesting notification permission:', error);
        }
      } else {
        // Permission denied, show instructions
        alert('Notification permission was denied. Please enable notifications in your browser settings to receive reminders.');
        console.warn('⚠️ Cannot enable notifications - permission denied');
      }
    } else {
      // User wants to disable notifications
      notificationService.setNotificationsEnabled(false);
      setNotificationsEnabled(false);
      console.log('⏸️ Notifications disabled');
    }
  };

  const handleTestNotification = async () => {
    console.log('🔔 Test notification button clicked');
    try {
      await notificationService.testNotification();
    } catch (error) {
      console.error('❌ Test notification failed:', error);
      alert('Failed to show test notification. Check console for details.');
    }
  };

  const loadMedications = async () => {
    if (!uid) return;
    
    try {
      const meds = await api.getMedications(uid);
      setMedications(meds);
    } catch (error) {
      console.error('Failed to load medications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewMedName('');
    setNewMedTime('');
    setNewMedFrequency('daily');
    setNewMedCustomDays(undefined); // 🔥 NEW
    setNewMedDose('');
    setNewMedAmount('');
    setNewMedInstructions('');
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !newMedName || !newMedTime) return;

    // 🔥 NEW: Validate custom frequency
    if (newMedFrequency === 'custom') {
      if (!newMedCustomDays || newMedCustomDays < 1 || newMedCustomDays > 365) {
        alert('Please enter a valid number of days between 1 and 365 for custom frequency');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await api.createMedication(uid, {
        name: newMedName,
        time: newMedTime,
        frequency: newMedFrequency,
        customDays: newMedFrequency === 'custom' ? newMedCustomDays : undefined, // 🔥 NEW
        dose: newMedDose || undefined,
        amount: newMedAmount || undefined,
        instructions: newMedInstructions || undefined,
      });
      resetForm();
      setShowAddModal(false);
      // Don't need to reload - WebSocket will update
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add medication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !editingMed) return;

    // 🔥 NEW: Validate custom frequency
    if (newMedFrequency === 'custom') {
      if (!newMedCustomDays || newMedCustomDays < 1 || newMedCustomDays > 365) {
        alert('Please enter a valid number of days between 1 and 365 for custom frequency');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await api.updateMedication(uid, editingMed.name, {
        time: newMedTime,
        frequency: newMedFrequency,
        customDays: newMedFrequency === 'custom' ? newMedCustomDays : undefined, // 🔥 NEW
        dose: newMedDose || undefined,
        amount: newMedAmount || undefined,
        instructions: newMedInstructions || undefined,
      });
      setShowEditModal(false);
      setEditingMed(null);
      resetForm();
      // Don't need to reload - WebSocket will update
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update medication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (med: Medication) => {
    setEditingMed(med);
    setNewMedTime(med.time);
    setNewMedFrequency(med.frequency);
    setNewMedCustomDays(med.customDays); // 🔥 NEW
    setNewMedDose(med.dose || '');
    setNewMedAmount(med.amount || '');
    setNewMedInstructions(med.instructions || '');
    setShowEditModal(true);
  };

  const handleDeleteMedication = async (medName: string) => {
    if (!uid || !confirm(`Delete ${medName}?`)) return;

    try {
      await api.deleteMedication(uid, medName);
      // Don't need to reload - WebSocket will update
    } catch (error) {
      alert('Failed to delete medication');
    }
  };

  const handleToggleTaken = async (med: Medication) => {
    if (!uid) return;

    try {
      if (med.taken) {
        await api.markMedicationNotTaken(uid, med.name);
      } else {
        await api.markMedicationTaken(uid, med.name);
      }
      // Don't need to reload - WebSocket will update
    } catch (error) {
      alert('Failed to update medication');
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedTimezone) return;

    setIsSubmitting(true);
    try {
      await api.updateSettings(selectedTimezone);
      alert('Timezone updated successfully!');
      setShowSettings(false);
      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await logout();
      navigate('/');
    }
  };

  // 🔥 UPDATED: Now accepts customDays parameter
  const getFrequencyLabel = (frequency: FrequencyType, customDays?: number) => {
    if (frequency === 'custom' && customDays) {
      return `Every ${customDays} day${customDays > 1 ? 's' : ''}`;
    }
    return FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label || frequency;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Cuddle Blahaj Medication Reminders</h1>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>
                  {user?.discordId && 'Dashboard • Synced with Discord • '}
                  Timezone: {user?.timezone || 'UTC'}
                </span>
                {/* WebSocket Status Indicator */}
                {isConnected ? (
                  <span className="flex items-center gap-1 text-green-400">
                    <Wifi className="w-3 h-3" />
                    Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <WifiOff className="w-3 h-3" />
                    {connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                  </span>
                )}
                {/* Notification Status Indicator */}
                {notificationService.isSupported() && (
                  <span className={`flex items-center gap-1 ${notificationsEnabled ? 'text-green-400' : 'text-gray-500'}`}>
                    {notificationsEnabled ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                    {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700 hover:border-gray-600"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700 hover:border-gray-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl hover:shadow-primary-500/50 transition-all border border-primary-500"
          >
            <Plus className="w-5 h-5" />
            Add Medication
          </button>
        </div>

        {/* Medications List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading medications...</p>
          </div>
        ) : medications.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-12 text-center">
            <Pill className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No medications yet</h3>
            <p className="text-gray-400 mb-6">Add your first medication to get started with reminders</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add Medication
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => (
              <div
                key={med.name}
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg hover:shadow-xl hover:border-gray-600 transition-all p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <button
                      onClick={() => handleToggleTaken(med)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                        med.taken
                          ? 'bg-green-600 border-green-500'
                          : 'border-gray-600 hover:border-primary-500'
                      }`}
                    >
                      {med.taken && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${med.taken ? 'text-gray-500 line-through' : 'text-white'}`}>
                        {med.name}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {med.time}
                        </span>
                        <span className="font-medium text-primary-400">
                          {getFrequencyLabel(med.frequency, med.customDays)} {/* 🔥 UPDATED: Pass customDays */}
                        </span>
                      </div>
                      {(med.dose || med.amount || med.instructions) && (
                        <div className="mt-2 space-y-1 text-sm">
                          {med.dose && (
                            <p className="text-gray-400">
                              <span className="font-medium text-gray-300">Dose:</span> {med.dose}
                            </p>
                          )}
                          {med.amount && (
                            <p className="text-gray-400">
                              <span className="font-medium text-gray-300">Amount:</span> {med.amount}
                            </p>
                          )}
                          {med.instructions && (
                            <p className="text-gray-400">
                              <span className="font-medium text-gray-300">Instructions:</span> {med.instructions}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(med)}
                      className="text-primary-400 hover:bg-primary-900/30 p-2 rounded-lg transition-colors border border-transparent hover:border-primary-600"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedication(med.name)}
                      className="text-red-400 hover:bg-red-900/30 p-2 rounded-lg transition-colors border border-transparent hover:border-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal styles */}
      <style>{`
        input, select, textarea {
          color-scheme: dark;
        }
      `}</style>

      {/* Notification Permission Modal */}
      {showNotificationModal && (
        <NotificationPermissionModal
          onAllow={handleAllowNotifications}
          onDeny={handleDenyNotifications}
          onClose={() => {
            localStorage.setItem('notification_modal_seen', 'true');
            setShowNotificationModal(false);
          }}
        />
      )}

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add Medication</h2>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-200"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddMedication}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g., Aspirin"
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frequency *
                  </label>
                  <select
                    value={newMedFrequency}
                    onChange={(e) => {
                      setNewMedFrequency(e.target.value as FrequencyType);
                      // Reset customDays when changing away from custom
                      if (e.target.value !== 'custom') {
                        setNewMedCustomDays(undefined);
                      }
                    }}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    {FREQUENCY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* 🔥 NEW: Custom Days Field - Only shown when frequency is 'custom' */}
                {newMedFrequency === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Days Between Doses *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={newMedCustomDays || ''}
                      onChange={(e) => setNewMedCustomDays(parseInt(e.target.value) || undefined)}
                      placeholder="e.g., 10 for every 10 days"
                      required={newMedFrequency === 'custom'}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a number between 1 and 365 days
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dose (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMedDose}
                    onChange={(e) => setNewMedDose(e.target.value)}
                    placeholder="e.g., 10mg, 2 tablets"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMedAmount}
                    onChange={(e) => setNewMedAmount(e.target.value)}
                    placeholder="e.g., 1 pill, 5ml"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Instructions (Optional)
                  </label>
                  <textarea
                    value={newMedInstructions}
                    onChange={(e) => setNewMedInstructions(e.target.value)}
                    placeholder="e.g., Take with food"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Medication Modal */}
      {showEditModal && editingMed && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Medication</h2>
              <button
                onClick={() => { setShowEditModal(false); setEditingMed(null); resetForm(); }}
                className="text-gray-400 hover:text-gray-200"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-300">
                <span className="font-medium text-white">Editing:</span> {editingMed.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Note: You cannot change the medication name
              </p>
            </div>
            <form onSubmit={handleEditMedication}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frequency *
                  </label>
                  <select
                    value={newMedFrequency}
                    onChange={(e) => {
                      setNewMedFrequency(e.target.value as FrequencyType);
                      // Reset customDays when changing away from custom
                      if (e.target.value !== 'custom') {
                        setNewMedCustomDays(undefined);
                      }
                    }}
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    {FREQUENCY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* 🔥 NEW: Custom Days Field - Only shown when frequency is 'custom' */}
                {newMedFrequency === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Days Between Doses *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={newMedCustomDays || ''}
                      onChange={(e) => setNewMedCustomDays(parseInt(e.target.value) || undefined)}
                      placeholder="e.g., 10 for every 10 days"
                      required={newMedFrequency === 'custom'}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a number between 1 and 365 days
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dose (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMedDose}
                    onChange={(e) => setNewMedDose(e.target.value)}
                    placeholder="e.g., 10mg, 2 tablets"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMedAmount}
                    onChange={(e) => setNewMedAmount(e.target.value)}
                    placeholder="e.g., 1 pill, 5ml"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Instructions (Optional)
                  </label>
                  <textarea
                    value={newMedInstructions}
                    onChange={(e) => setNewMedInstructions(e.target.value)}
                    placeholder="e.g., Take with food"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingMed(null); resetForm(); }}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timezone
                </label>
                <select
                  value={selectedTimezone}
                  onChange={(e) => setSelectedTimezone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  {TIMEZONE_OPTIONS.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Your medication reminders will be sent based on this timezone
                </p>
              </div>

              {/* Notification Toggle */}
              {notificationService.isSupported() && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Browser Notifications
                  </label>
                  <button
                    onClick={handleToggleNotifications}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                      notificationsEnabled
                        ? 'bg-primary-900/30 border-primary-600 text-primary-300'
                        : 'bg-gray-900 border-gray-700 text-gray-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      {notificationsEnabled ? 'Notifications Enabled' : 'Notifications Disabled'}
                    </span>
                    <span className="text-xs">
                      {notificationPermission === 'denied' && '(Blocked in browser)'}
                    </span>
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    {notificationsEnabled
                      ? 'You\'ll receive browser notifications when medications are due'
                      : notificationPermission === 'denied'
                      ? 'Enable notifications in your browser settings to receive reminders'
                      : 'Enable to receive browser notifications for medication reminders'}
                  </p>
                  
                  {/* Test Notification Button */}
                  {notificationsEnabled && notificationPermission === 'granted' && (
                    <button
                      onClick={handleTestNotification}
                      className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors text-sm"
                    >
                      <Volume2 className="w-4 h-4" />
                      Test Notification
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}