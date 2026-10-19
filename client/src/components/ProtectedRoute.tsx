import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type UserRole } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRole: UserRole;
}

export default function ProtectedRoute({
  allowedRole,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-6 text-center">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole === "ADMIN" && user.role !== "ADMIN") {
    return <Navigate to="/author" replace />;
  }

  return <Outlet />;
}