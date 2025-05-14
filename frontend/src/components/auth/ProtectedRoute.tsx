import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Role, roleUtils } from '@/lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role | string;
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
  if (requiredRole && user) {
    // Convert both to our Role type to ensure consistent comparison
    const userRole = roleUtils.normalizeRole(user.role);
    const requiredRoleNormalized = roleUtils.normalizeRole(requiredRole);
    
    // Use our utility to check if the user has sufficient privileges
    if (!roleUtils.hasAtLeastSamePrivilegesAs(userRole, requiredRoleNormalized)) {
      return <Navigate to="/" replace />;
    }
  }

  // If authenticated and has required role, render children
  return <>{children}</>;
} 