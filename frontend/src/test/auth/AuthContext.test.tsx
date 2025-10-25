import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../../auth/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Test component that uses auth context
const TestComponent = () => {
  const { user, login, logout, loading, error } = useAuth();
  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error" role="alert">{error}</div>}
      {user ? (
        <>
          <div data-testid="username">{user.username}</div>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login('test.user', 'password')}>Login</button>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  const renderWithAuth = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('should provide login functionality', async () => {
    renderWithAuth();
    
    // Initially no user
    expect(screen.queryByTestId('username')).not.toBeInTheDocument();
    
    // Click login
    fireEvent.click(screen.getByText('Login'));
    
    // Wait for user to be logged in
    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('test.user');
    }, { timeout: 2000 });
    
    // Should not show loading or error states
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  it('should handle login failure', async () => {
    renderWithAuth();
    
    // Mock failed login
    server.use(
      http.post('http://127.0.0.1:8000/api/token/', () => {
        return HttpResponse.json(
          { detail: 'Invalid credentials', status: 'error' },
          { status: 401 }
        );
      })
    );
    
    // Click login with wrong credentials
    await act(async () => {
      fireEvent.click(screen.getByText('Login'));
    });
    
    // Should show error message and not set user
    await waitFor(() => {
      expect(screen.queryByTestId('error')).toBeInTheDocument();
      expect(screen.queryByTestId('username')).not.toBeInTheDocument();
    });
  });

  it('should provide logout functionality', async () => {
    renderWithAuth();
    
    // Login first
    await act(async () => {
      fireEvent.click(screen.getByText('Login'));
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('username')).toBeInTheDocument();
    });
    
    // Click logout
    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });
    
    // Should be logged out
    expect(screen.queryByTestId('username')).not.toBeInTheDocument();
  });

  it('should maintain auth state after refresh', async () => {
    // Set tokens in localStorage to simulate existing session
    // tokenService uses keys 'access' and 'refresh'
    localStorage.setItem('access', 'fake.access.token');
    localStorage.setItem('refresh', 'fake.refresh.token');
    
    renderWithAuth();
    
    // Should auto-login with stored tokens
    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('test.user');
    });
  });
});