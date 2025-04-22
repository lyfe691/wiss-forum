import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-border">
        <Link to="/">
          <img src="/logo.png" alt="Wiss Forum Logo" className="h-8 w-auto" /> {/* Adjusted size */}
        </Link>
        <nav className="space-x-4 flex items-center"> 
          <Button 
            variant="link"
            onClick={() => navigate('/help')}
          > 
            Help
          </Button>
          {/* Conditionally show Sign In/Sign Up based on current page */}
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

      {/* Main Content - Render child routes here */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <Outlet /> {/* Child routes (Login, Register) will render here */}
      </main>

      {/* Footer */}
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