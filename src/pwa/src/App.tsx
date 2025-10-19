// src/pwa/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import Welcome from './pages/Welcome';
import Connect from './pages/Connect';
import Dashboard from './pages/Dashboard';
import LinkDiscord from './pages/LinkDiscord';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { uid, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!uid) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { uid } = useUser();

  return (
    <Routes>
      <Route path="/" element={uid ? <Navigate to="/dashboard" replace /> : <Welcome />} />
      <Route path="/connect" element={<Connect />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/link-discord"
        element={
          <PrivateRoute>
            <LinkDiscord />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  );
}