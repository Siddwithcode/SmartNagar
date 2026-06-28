import { Navigate, Outlet } from 'react-router-dom';
import { LoadingScreen } from '@/components/auth/LoadingScreen';
import { useAuth } from '@/context/AuthContext';

export function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading admin portal..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
