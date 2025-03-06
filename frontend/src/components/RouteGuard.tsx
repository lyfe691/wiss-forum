import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: ('student' | 'teacher' | 'admin')[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, isLoading, isAuthenticated, checkAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, checkAuth]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-3 p-8">
        <Skeleton className="h-8 w-full max-w-sm" />
        <Skeleton className="h-8 w-full max-w-sm" />
        <Skeleton className="h-8 w-full max-w-sm" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the protected component
  return <>{children}</>;
} 