// src/pwa/src/pages/Connect.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../contexts/UserContext';

export default function Connect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting your account...');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid connection link. No token provided.');
      return;
    }

    validateToken(token);
  }, [searchParams]);

  const validateToken = async (token: string) => {
    try {
      const { uid, user } = await api.validateConnectToken(token);
      setUser(uid, user);
      setStatus('success');
      setMessage('Successfully connected your Discord account!');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error 
          ? error.message 
          : 'Failed to connect. The link may have expired.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-primary-500 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connecting...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connected!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="text-sm text-gray-500">Redirecting to dashboard...</div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Failed</h2>
            <p className="text-gray-600 mb-8">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Go to Home
              </button>
              <p className="text-sm text-gray-500">
                Try running <code className="bg-gray-100 px-2 py-1 rounded">/webconnect</code> in Discord again
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}