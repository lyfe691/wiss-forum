import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// auth layout component, used to wrap the auth pages

export function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  const alternateAuthAction = isLoginPage 
    ? { label: "Don't have an account? Sign up", path: '/register' } 
    : { label: "Already have an account? Sign in", path: '/login' };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-4 flex justify-between items-center border-b border-border">
        <Link to="/">
          <img src="/logo.png" alt="Wiss Forum Logo" className="h-8 w-auto" />
        </Link>
        <nav className="space-x-4 flex items-center"> 
          <Button 
            variant="link"
            onClick={() => navigate('/help')}
          > 
            Help
          </Button>
          {!isLoginPage && (
            <Button 
              variant="outline"
              onClick={() => navigate('/login')}
            > 
              Sign In
            </Button>
          )}
          {!isRegisterPage && (
            <Button 
              variant="outline"
              onClick={() => navigate('/register')}
            > 
              Sign Up
            </Button>
          )}
        </nav>
      </header>

      {/* main content - render child routes here */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <Outlet /> 
      </main>

      {/* footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground border-t border-border">
        <Button 
          variant="link" 
          className="font-semibold" 
          onClick={() => navigate(alternateAuthAction.path)}
        > 
          {alternateAuthAction.label}
        </Button>
      </footer>
    </div>
  );
} 