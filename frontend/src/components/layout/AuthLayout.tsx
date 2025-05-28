import { Outlet } from 'react-router-dom';

// auth layout component, used to wrap the auth pages

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
} 