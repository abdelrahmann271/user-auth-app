import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authApi } from '../api';
import { TOKEN_EXPIRED_EVENT } from '../../../shared/api';
import type { User } from '../../../shared/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const handleTokenExpired = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
    setSessionExpired(true);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
    window.addEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpired);
    return () => {
      window.removeEventListener(TOKEN_EXPIRED_EVENT, handleTokenExpired);
    };
  }, [handleTokenExpired]);

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.signin(email, password);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    setSessionExpired(false);
  }, []);

  const signup = useCallback(async (email: string, name: string, password: string) => {
    const response = await authApi.signup(email, name, password);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    setSessionExpired(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        sessionExpired,
        login,
        signup,
        logout,
        clearSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
