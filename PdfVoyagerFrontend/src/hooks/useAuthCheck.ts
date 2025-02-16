// src/hooks/useAuthCheck.ts
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export const useAuthCheck = () => {
  const { checkAuth, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();

      const interval = setInterval(checkAuth, 300000);
      return () => clearInterval(interval);
    };

    verifyAuth();
  }, [checkAuth]);

  return { isAuthenticated, isLoading };
};
