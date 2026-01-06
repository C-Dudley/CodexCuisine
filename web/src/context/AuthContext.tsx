/**
 * AuthContext - Authentication State Management
 *
 * Manages user authentication state and provides login/logout/refresh functions
 * Uses httpOnly cookies for secure token storage (automatically handled by fetch)
 * Auto-refreshes tokens 10 minutes before expiry to keep user logged in
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
  userId: string;
  email: string;
  role?: string;
  plan?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component - wrap your app with this
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Check if user is already logged in by calling /api/auth/session
   */
  const checkSession = useCallback(async () => {
    try {
      // This endpoint should be created on the backend
      // For now, we assume it validates the existing JWT cookie
      const response = await fetch('/api/auth/session', {
        credentials: 'include', // Important: includes httpOnly cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      }
      // If response is not ok, user is not logged in (no error needed)
    } catch (err) {
      console.error('Session check failed:', err);
      // Network error or endpoint not available - this is ok during development
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh the access token using the refresh token
   */
  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      } else if (response.status === 401) {
        // Refresh token expired - logout
        setUser(null);
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      setUser(null);
    }
  }, []);

  /**
   * Check session on mount
   */
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /**
   * Auto-refresh token every 10 minutes if user is logged in
   */
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      await refreshSession();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [user, refreshSession]);

  /**
   * Sign in with email and password
   * Calls CodexClarity's /api/auth/login endpoint
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        setLoading(true);

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message || 'Login failed. Please try again.'
          );
        }

        const data = await response.json();

        if (data.data?.requiresMfa) {
          // MFA required - in Phase 8.2 we handle basic flow
          // TODO: Implement MFA verification page
          setError('MFA verification required - feature coming soon');
          return;
        }

        if (data.data) {
          setUser(data.data);
          navigate('/'); // Redirect to home
        }
      } catch (err: any) {
        const message = err.message || 'Login failed. Please try again.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  /**
   * Sign up with email and password
   * Calls CodexClarity's /api/auth/signup endpoint
   */
  const signUp = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        setLoading(true);

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error?.message || 'Sign up failed. Please try again.'
          );
        }

        const data = await response.json();

        if (data.data) {
          setUser(data.data);
          navigate('/'); // Redirect to home
        }
      } catch (err: any) {
        const message = err.message || 'Sign up failed. Please try again.';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  /**
   * Logout - clear session on backend and clear local state
   */
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {
        // Logout endpoint might not exist yet - continue anyway
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 * Throws error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
