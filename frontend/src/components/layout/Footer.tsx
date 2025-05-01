import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Github, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-muted/30 border-t border-border py-6 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold">WISS Forum</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              A forum for WISS students and teachers to discuss topics and share knowledge.
            </p>
            
            <div className="flex items-center gap-4 mt-6">
            <a
              href="https://github.com/barkintaco/wiss-forum"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-semibold text-sm gap-2 bg-background/40 border border-primary/20 hover:border-primary/30 hover:bg-primary/5 px-3 py-2 rounded-md transition-colors"
            >
              <Github className="h-5 w-5 text-primary" />
              <span className="text-primary">Contribute to the project</span>
              <span className="sr-only">GitHub</span>
            </a>
            </div>
          </div>
          
          <div className="grid gap-8 grid-cols-3 md:col-span-3">
            <div>
              <h2 className="text-sm font-semibold mb-3">Resources</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/categories" className="text-muted-foreground hover:text-primary transition-colors">
                    <span>Categories</span>
                  </Link>
                </li>
                <li>
                  <Link to="/topics/latest" className="text-muted-foreground hover:text-primary transition-colors">
                    <span>Latest Topics</span>
                  </Link>
                </li>
                <li>
                  <Link to="/users" className="text-muted-foreground hover:text-primary transition-colors">
                    <span>Community</span>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-sm font-semibold mb-3">Account</h2>
              <ul className="space-y-2 text-sm">
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                        <span>Profile</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" className="text-muted-foreground hover:text-primary transition-colors">
                        <span>Settings</span>
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link to="/register" className="text-muted-foreground hover:text-primary transition-colors">
                        Register
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
            
            <div>
              <h2 className="text-sm font-semibold mb-3">Support</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">
                    <span>Help Center</span>
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    <span>Terms</span>
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    <span>Privacy</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
          <div className="mb-4 sm:mb-0">
            <span className="text-muted-foreground">
              © {currentYear} WISS Forum. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
} 