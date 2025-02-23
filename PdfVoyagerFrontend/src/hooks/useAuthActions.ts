import { useState } from "react";
import { useAuth } from "../context/AuthContext";

// src/hooks/useAuthActions.ts
export const useAuthActions = () => {
  const { login, logout, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) await checkAuth();
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, handleLogout, isLoading };
};
