// src/pwa/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pill, LogOut, Trash2, Check, X, Edit2, Settings, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { Medication, FrequencyType, FREQUENCY_OPTIONS, TIMEZONE_OPTIONS } from '../types';

export default function Dashboard() {
  const { uid, user, logout } = useUser();
  const navigate = useNavigate();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add/Edit Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  
  // Settings Modal
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState(user?.timezone || 'UTC');
  
  // Form States
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState<FrequencyType>('daily');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedAmount, setNewMedAmount] = useState('');
  const [newMedInstructions, setNewMedInstructions] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      loadMedications();
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
      loadMedications();
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
      loadMedications();
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
      loadMedications();
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
      window.location.reload(); // Reload to update user context
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
              <p className="text-xs text-gray-500">
                {user?.discordId && 'Synced with Discord • '}
                Timezone: {user?.timezone || 'UTC'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Discord Integration Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-800 text-sm font-medium">
              Discord Connected • V2 Features Active
            </p>
            <p className="text-green-700 text-xs mt-1">
              Use <code className="bg-green-100 px-1 rounded">/addmed</code>, <code className="bg-green-100 px-1 rounded">/editmed</code>, <code className="bg-green-100 px-1 rounded">/timezone</code> commands in Discord.
            </p>
          </div>
        </div>

        {/* Add Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Medication
          </button>
        </div>

        {/* Medications List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading medications...</p>
          </div>
        ) : medications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No medications yet</h3>
            <p className="text-gray-600 mb-6">Add your first medication to get started with reminders</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add Medication
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => (
              <div
                key={med.name}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <button
                      onClick={() => handleToggleTaken(med)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                        med.taken
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-primary-500'
                      }`}
                    >
                      {med.taken && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${med.taken ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {med.name}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {med.time}
                        </span>
                        <span className="font-medium text-primary-600">
                          {getFrequencyLabel(med.frequency)}
                        </span>
                      </div>
                      {(med.dose || med.amount || med.instructions) && (
                        <div className="mt-2 space-y-1 text-sm">
                          {med.dose && (
                            <p className="text-gray-600">
                              <span className="font-medium">Dose:</span> {med.dose}
                            </p>
                          )}
                          {med.amount && (
                            <p className="text-gray-600">
                              <span className="font-medium">Amount:</span> {med.amount}
                            </p>
                          )}
                          {med.instructions && (
                            <p className="text-gray-600">
                              <span className="font-medium">Instructions:</span> {med.instructions}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(med)}
                      className="text-primary-500 hover:bg-primary-50 p-2 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedication(med.name)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
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

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Medication</h2>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddMedication}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g., Aspirin"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency *
                  </label>
                  <select
                    value={newMedFrequency}
                    onChange={(e) => setNewMedFrequency(e.target.value as FrequencyType)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    {FREQUENCY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dose (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMedDose}
                    onChange={(e) => setNewMedDose(e.target.value)}
                    placeholder="e.g., 10mg, 2 tablets"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMedAmount}
                    onChange={(e) => setNewMedAmount(e.target.value)}
                    placeholder="e.g., 1 pill, 5ml"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions (Optional)
                  </label>
                  <textarea
                    value={newMedInstructions}
                    onChange={(e) => setNewMedInstructions(e.target.value)}
                    placeholder="e.g., Take with food"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Medication</h2>
              <button
                onClick={() => { setShowEditModal(false); setEditingMed(null); resetForm(); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">Editing:</span> {editingMed.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Note: You cannot change the medication name
              </p>
            </div>
            <form onSubmit={handleEditMedication}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency *
                  </label>
                  <select
                    value={newMedFrequency}
                    onChange={(e) => setNewMedFrequency(e.target.value as FrequencyType)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    {FREQUENCY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dose (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMedDose}
                    onChange={(e) => setNewMedDose(e.target.value)}
                    placeholder="e.g., 10mg, 2 tablets"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMedAmount}
                    onChange={(e) => setNewMedAmount(e.target.value)}
                    placeholder="e.g., 1 pill, 5ml"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions (Optional)
                  </label>
                  <textarea
                    value={newMedInstructions}
                    onChange={(e) => setNewMedInstructions(e.target.value)}
                    placeholder="e.g., Take with food"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingMed(null); resetForm(); }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={selectedTimezone}
                  onChange={(e) => setSelectedTimezone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  {TIMEZONE_OPTIONS.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Your medication reminders will be sent based on this timezone
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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