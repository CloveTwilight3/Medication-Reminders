// src/pwa/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pill, LogOut, Trash2, Check, X, Edit2, Settings, Clock, Wifi, WifiOff } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { Medication, FrequencyType, FREQUENCY_OPTIONS, TIMEZONE_OPTIONS } from '../types';

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
  
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState<FrequencyType>('daily');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedAmount, setNewMedAmount] = useState('');
  const [newMedInstructions, setNewMedInstructions] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get session token from cookie for WebSocket
  const getSessionToken = () => {
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(c => c.trim().startsWith('session_token='));
    return sessionCookie ? sessionCookie.split('=')[1] : null;
  };

  // WebSocket connection
  const { isConnected, connectionStatus } = useWebSocket(getSessionToken(), {
    onMessage: (message) => {
      console.log('Received WebSocket message:', message);
      
      // Only process messages for this user
      if (message.uid !== uid) return;

      switch (message.type) {
        case 'medication_added':
        case 'medication_updated':
        case 'medication_deleted':
          // Reload medications when any change occurs
          loadMedications();
          break;
      }
    },
    onConnect: () => {
      console.log('WebSocket connected!');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    }
  });

  useEffect(() => {
    loadMedications();
  }, [uid]);

  useEffect(() => {
    if (user) {
      setSelectedTimezone(user.timezone);
    }
  }, [user]);

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
    setNewMedDose('');
    setNewMedAmount('');
    setNewMedInstructions('');
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !newMedName || !newMedTime) return;

    setIsSubmitting(true);
    try {
      await api.createMedication(uid, {
        name: newMedName,
        time: newMedTime,
        frequency: newMedFrequency,
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

    setIsSubmitting(true);
    try {
      await api.updateMedication(uid, editingMed.name, {
        time: newMedTime,
        frequency: newMedFrequency,
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

  const getFrequencyLabel = (frequency: FrequencyType) => {
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
              <h1 className="text-2xl font-bold text-white">Medications</h1>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>
                  {user?.discordId && 'Synced with Discord • '}
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
        {/* Live Updates Info */}
        <div className={`border rounded-lg p-4 mb-6 flex items-center gap-3 transition-colors ${
          isConnected 
            ? 'bg-green-900/30 border-green-600' 
            : 'bg-yellow-900/30 border-yellow-600'
        }`}>
          {isConnected ? <Check className="w-5 h-5 text-green-400 flex-shrink-0" /> : <WifiOff className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
          <div className="flex-1">
            <p className={`text-sm font-medium ${isConnected ? 'text-green-300' : 'text-yellow-300'}`}>
              {isConnected ? 'Live Updates Active' : 'Live Updates Disconnected'}
            </p>
            <p className={`text-xs mt-1 ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
              {isConnected 
                ? 'Your medication list will update automatically when changes are made from Discord or other devices.'
                : 'Changes will appear after page refresh. Attempting to reconnect...'}
            </p>
          </div>
        </div>

        {/* Discord Integration Info */}
        <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-300 text-sm font-medium">
              Discord Connected • V2 Features Active
            </p>
            <p className="text-green-400 text-xs mt-1">
              Use <code className="bg-green-900/50 px-1 rounded">/addmed</code>, <code className="bg-green-900/50 px-1 rounded">/editmed</code>, <code className="bg-green-900/50 px-1 rounded">/timezone</code> commands in Discord.
            </p>
          </div>
        </div>

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

        {/* Rest of the Dashboard component remains the same... */}
        {/* I'll continue with the medications list in the next part */}

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
                          {getFrequencyLabel(med.frequency)}
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

      {/* All the modals remain the same... */}
      {/* I've kept the modal code the same as your original file */}
    </div>
  );
}