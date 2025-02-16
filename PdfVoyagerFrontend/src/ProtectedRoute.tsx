import { Navigate, Outlet } from "react-router-dom";
import { useAuthCheck } from "./hooks/useAuthCheck";

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthCheck();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
export default ProtectedRoute;
