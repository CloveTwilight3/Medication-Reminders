// src/pwa/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pill, LogOut, Trash2, Check, X } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { Medication } from '../types';

export default function Dashboard() {
  const { uid, user, logout } = useUser();
  const navigate = useNavigate();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMedications();
  }, [uid]);

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

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !newMedName || !newMedTime) return;

    setIsSubmitting(true);
    try {
      await api.createMedication(uid, newMedName, newMedTime);
      setNewMedName('');
      setNewMedTime('');
      setShowAddModal(false);
      loadMedications();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add medication');
    } finally {
      setIsSubmitting(false);
    }
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

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await logout();
      navigate('/');
    }
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
              {user?.discordId && (
                <p className="text-xs text-gray-500">Synced with Discord</p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Discord Integration Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-800 text-sm font-medium">
              Discord Connected
            </p>
            <p className="text-green-700 text-xs mt-1">
              You'll receive reminders in Discord DMs. Use <code className="bg-green-100 px-1 rounded">/addmed</code>, <code className="bg-green-100 px-1 rounded">/listmeds</code>, and other commands.
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
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleTaken(med)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      med.taken
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    {med.taken && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <div>
                    <h3 className={`font-semibold ${med.taken ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {med.name}
                    </h3>
                    <p className="text-sm text-gray-500">Daily at {med.time}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMedication(med.name)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Medication</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddMedication}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medication Name
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
                    Time
                  </label>
                  <input
                    type="time"
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
    </div>
  );
}