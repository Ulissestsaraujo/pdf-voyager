import { Navigate, Outlet } from "react-router-dom";
import { useAuthCheck } from "./hooks/useAuthCheck";
import { useEffect, useState } from "react";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthCheck();
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !showLoading) {
    return <div />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
export default ProtectedRoute;
