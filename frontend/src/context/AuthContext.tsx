'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AuthState, 
  User, 
  LoginCredentials, 
  RegisterCredentials 
} from '@/types';
import { authApi } from '@/services/api';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
interface AuthContextProps {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      // Check if code is running on client-side
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        
        if (!token) {
          dispatch({ type: 'LOGOUT' });
          return;
        }
        
        try {
          dispatch({ type: 'AUTH_START' });
          const response = await authApi.getCurrentUser();
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.user,
              token,
            },
          });
        } catch {
          localStorage.removeItem('token');
          dispatch({
            type: 'AUTH_ERROR',
            payload: 'Session expired. Please login again.',
          });
        }
      }
    };
    
    loadUser();
  }, []);

  // Login user
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authApi.login(credentials);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
      }
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });
      
      router.push('/chat');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 
        typeof error === 'object' && error !== null && 'response' in error ? 
        (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed. Please try again.' : 'Login failed. Please try again.';
      
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
    }
  };

  // Register user
  const register = async (credentials: RegisterCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authApi.register(credentials);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
      }
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
        },
      });
      
      router.push('/chat');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 
        typeof error === 'object' && error !== null && 'response' in error ? 
        (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed. Please try again.' : 'Registration failed. Please try again.';
      
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
    }
  };

  // Logout user
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    dispatch({ type: 'LOGOUT' });
    router.push('/');
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
