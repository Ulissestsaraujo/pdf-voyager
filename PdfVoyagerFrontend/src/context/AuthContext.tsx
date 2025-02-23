// src/context/AuthContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../helpers/apiConnector";
import useInterval from "../hooks/useInterval";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshPromise, setRefreshPromise] = useState<Promise<void> | null>(
    null
  );

  const login = async (email: string, password: string) => {
    try {
      await api.post("/api/auth/login", { email, password });
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = useCallback(async () => {
    try {
      await api.get("/api/auth/user-info");
      setIsAuthenticated(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      if (!refreshPromise) {
        const promise = refreshAuth();
        setRefreshPromise(promise);
        await promise;
      }
      await refreshPromise;
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
      setRefreshPromise(null);
    }
  }, [refreshPromise]);

  const refreshAuth = async () => {
    try {
      await api.post("/api/auth/refresh");
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useInterval(() => {
    if (isAuthenticated) refreshAuth();
  }, 60 * 1000 * 10);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, checkAuth, logout, login }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
