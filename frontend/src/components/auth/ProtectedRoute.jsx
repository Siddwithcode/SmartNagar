import { Navigate, Outlet } from 'react-router-dom';
import { LoadingScreen } from '@/components/auth/LoadingScreen';
import { useAuth } from '@/context/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Verifying your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
