// src/context/AuthContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../helpers/apiConnector";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async (silent = false) => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setIsAuthenticated(false);
      setIsLoading(false);
      if (!silent) {
        window.location.href = "/login";
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await api.post("/api/auth/login", { email, password });
      setIsAuthenticated(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      await api.get("/api/auth/user-info");
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth();
      } catch {
        await logout(true);
      }
    };
    initializeAuth();
  }, [checkAuth, logout]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, checkAuth, logout, login }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
