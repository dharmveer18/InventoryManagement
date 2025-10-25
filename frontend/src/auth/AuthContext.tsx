import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { login as srvLogin, getMe, refreshToken } from "./auth";
import { tokenService } from "./tokenService";
import { useNavigate } from "react-router-dom";
import { AUTH_EVENTS } from "./authEvents";

type AuthError = Error & { response?: { data?: { detail?: string } } };

interface Me {
  id: number;
  username: string;
  role: "admin"|"manager"|"viewer";
  perms: string[];
}

type AuthContextType = {
  user: Me|null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string|null;
};

// Create context with meaningful default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => { throw new Error('AuthContext not initialized') },
  logout: () => { throw new Error('AuthContext not initialized') },
  loading: true,
  error: null,
});

// Export the hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Me|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const mounted = useRef(false);

  // Handle unauthorized access
  const handleUnauthorized = useCallback(() => {
    // Don't redirect if we're already on login page
    if (window.location.pathname === '/login') return;

    // Don't redirect if we have valid user and tokens
    if (user && tokenService.getToken() && tokenService.getRefreshToken()) return;

    tokenService.clearTokens();
    setUser(null);
    setError('Session expired. Please login again.');
    navigate('/login');
  }, [navigate, user]);

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('AuthContext: Starting login process');
      const loginSuccess = await srvLogin(username, password);
      
      if (!loginSuccess) {
        throw new Error('Login failed');
      }
      
      console.log('AuthContext: Login successful, fetching user data');
      const me = await getMe();
      console.log('AuthContext: User data fetched:', me);
      
      setUser(me);
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      const error = err as AuthError;
      setError(error.message || 'Login failed');
      tokenService.clearTokens();
      handleUnauthorized();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    tokenService.clearTokens();  // Clear both tokens
    setUser(null);
  };

  // Handle initialization of auth state
  const initAuth = React.useCallback(async () => {
    console.log('AuthContext: Initializing auth state');
    
    const token = tokenService.getToken();
    const refresh = tokenService.getRefreshToken();
    
    console.log('AuthContext: Initial tokens -', 
      'Access:', token ? 'exists' : 'null',
      'Refresh:', refresh ? 'exists' : 'null'
    );

    if (!token && !refresh) {
      console.log('AuthContext: No tokens found, skipping initialization');
      setLoading(false);
      return;
    }

    try {
      // First try with existing access token
      if (token) {
        console.log('AuthContext: Attempting to get user data with existing token');
        try {
          const userData = await getMe();
          console.log('AuthContext: Successfully got user data:', userData);
          setUser(userData);
          setLoading(false);
          return;
        } catch (error) {
          console.log('AuthContext: Failed to get user data with existing token, will try refresh');
        }
      }

      // If we get here, either no access token or it failed
      if (refresh) {
        console.log('AuthContext: Attempting token refresh');
        try {
          const newToken = await refreshToken();
          if (newToken) {
            console.log('AuthContext: Token refresh successful, fetching user data');
            const userData = await getMe();
            console.log('AuthContext: Got user data after refresh:', userData);
            setUser(userData);
            setLoading(false);
            return;
          }
        } catch (refreshError) {
          console.error('AuthContext: Token refresh failed:', refreshError);
        }
      }

      // If we get here, both access and refresh failed
      console.log('AuthContext: All auth attempts failed, clearing state');
      handleUnauthorized();
    } catch (error) {
      console.error('AuthContext: Unexpected error during initialization:', error);
      handleUnauthorized();
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  // Effect for auth initialization
  useEffect(() => {
    // Skip initialization if we already have a user
    if (user) {
      console.log('AuthContext: Skipping init, user already exists:', user);
      setLoading(false);
      return;
    }

    // Prevent multiple initializations
    if (mounted.current) {
      console.log('AuthContext: Skipping init, already mounted');
      return;
    }
    mounted.current = true;

    initAuth();
  }, [user, initAuth]);

  // Effect for unauthorized event listener
  useEffect(() => {
    const handleUnauthorizedEvent = (event: Event) => {
      console.log('AuthContext: Unauthorized event received', {
        currentUser: user,
        hasTokens: Boolean(tokenService.getToken() && tokenService.getRefreshToken()),
        eventDetail: (event as CustomEvent).detail,
        pathname: window.location.pathname
      });
      handleUnauthorized();
    };

    console.log('AuthContext: Setting up event listener');
    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorizedEvent);

    return () => {
      console.log('AuthContext: Cleaning up event listener');
      window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, handleUnauthorizedEvent);
    };
  }, [user, handleUnauthorized]);

  return <AuthContext.Provider value={{ user, login, logout, loading, error }}>{children}</AuthContext.Provider>;
};
