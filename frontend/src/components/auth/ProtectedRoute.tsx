import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Role, roleUtils } from '@/lib/types';


// protected route component, checks if the user is authenticated and has the required role

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role | string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && user) {
    const userRole = roleUtils.normalizeRole(user.role);
    const requiredRoleNormalized = roleUtils.normalizeRole(requiredRole);

    if (!roleUtils.hasAtLeastSamePrivilegesAs(userRole, requiredRoleNormalized)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
} 