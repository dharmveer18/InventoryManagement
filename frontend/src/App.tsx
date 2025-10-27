import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { RequireAuth } from './auth/guards'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import './App.css'

// Separate component for better Fast Refresh support
const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (user && window.location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminDashboard />
          </RequireAuth>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;