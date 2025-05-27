import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';

// Import your other components
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const UserDashboard = React.lazy(() => import('./pages/UserDashboard'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <React.Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />

            {/* Protected routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute requiredRole="user">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App; 