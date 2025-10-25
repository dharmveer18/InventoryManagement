import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { RequireAuth } from './auth/guards'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import './App.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      cacheTime: 60 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
})

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
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // Consider data fresh for 30 seconds
      cacheTime: 60 * 60 * 1000, // Cache for 1 hour
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
})

// Separate component for better Fast Refresh support
const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  // Show loading state while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  // If we have a user and we're on login page, redirect to dashboard
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
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
  const { user, loading } = useAuth();
  
  // Show loading state while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  // If we have a user and we're on login page, redirect to dashboard
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
    </Routes>
  )
}

export default App
