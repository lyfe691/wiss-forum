import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Github, Twitter, MessageSquare, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated, logout } = useAuth();

  return (
    <footer className="bg-muted/30 border-t border-border py-10 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-4 lg:col-span-5">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold">WISS Forum</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              A forum for WISS students and teachers to discuss topics, share knowledge, and collaborate on projects in a supportive learning environment.
            </p>
            
            <div className="flex items-center gap-4 mt-6">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 md:col-span-8 lg:col-span-7">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h2>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/categories" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>Categories</span>
                  </Link>
                </li>
                <li>
                  <Link to="/topics/latest" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>Latest Topics</span>
                  </Link>
                </li>
                <li>
                  <Link to="/users" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>Community</span>
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>FAQ</span>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Account</h2>
              <ul className="space-y-3 text-sm">
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                        <span>Profile</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                        <span>Settings</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/notifications" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                        <span>Notifications</span>
                      </Link>
                    </li>
                    <li>
                      <button 
                        onClick={logout}
                        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <span>Logout</span>
                      </button>
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
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h2>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>Help Center</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>Contact Us</span>
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>Terms of Service</span>
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>Privacy Policy</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <Separator className="my-8 opacity-40" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
          <div className="flex items-center mb-4 sm:mb-0">
            <span className="text-muted-foreground flex items-center">
              © {currentYear} WISS Forum. Made with <Heart className="h-3.5 w-3.5 mx-1 text-destructive" /> by WISS Team
            </span>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/cookies" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Cookies
            </Link>
            <a 
              href="https://wiss.swiss" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center"
            >
              <span>WISS Website</span>
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 