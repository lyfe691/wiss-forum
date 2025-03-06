import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'teacher' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role if required
  if (requiredRole && user?.role !== requiredRole) {
    // For admin routes, redirect to home
    if (requiredRole === 'admin') {
      return <Navigate to="/" replace />;
    }
    
    // For teacher routes, allow admin access too
    if (requiredRole === 'teacher' && user?.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  }

  // If authenticated and has required role, render children
  return <>{children}</>;
} 