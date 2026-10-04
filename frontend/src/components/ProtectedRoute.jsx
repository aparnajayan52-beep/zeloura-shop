import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap a page in this to force login. After login the user returns to the page they wanted.
// Add the staffOnly prop to also require a shop admin (staff) account.
export default function ProtectedRoute({ children, staffOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="center muted">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (staffOnly && !user.is_staff) return <Navigate to="/" replace />;
  return children;
}