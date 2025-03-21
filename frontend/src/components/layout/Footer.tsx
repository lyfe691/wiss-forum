import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated, logout } = useAuth();

  return (
    <footer className="bg-background border-t border-border py-8 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">WISS Forum</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              A forum for WISS students and teachers to discuss topics, share knowledge, and collaborate.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h2 className="mb-4 text-sm font-semibold text-foreground uppercase">Resources</h2>
              <ul className="text-muted-foreground">
                <li className="mb-2">
                  <Link to="/categories" className="hover:underline hover:text-primary transition-colors">Categories</Link>
                </li>
                <li className="mb-2">
                  <Link to="/faq" className="hover:underline hover:text-primary transition-colors">FAQ</Link>
                </li>
                <li className="mb-2">
                  <Link to="/about" className="hover:underline hover:text-primary transition-colors">About</Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-semibold text-foreground uppercase">Account</h2>
              <ul className="text-muted-foreground">
                {isAuthenticated ? (
                  <>
                    <li className="mb-2">
                      <Link to="/profile" className="hover:underline hover:text-primary transition-colors flex items-center">
                        Profile
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link to="/settings" className="hover:underline hover:text-primary transition-colors flex items-center">
                        Settings
                      </Link>
                    </li>
                    <li className="mb-2">
                      <button 
                        onClick={logout}
                        className="hover:underline hover:text-primary transition-colors flex items-center text-muted-foreground"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="mb-2">
                      <Link to="/login" className="hover:underline hover:text-primary transition-colors">
                        Login
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link to="/register" className="hover:underline hover:text-primary transition-colors">
                        Register
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-semibold text-foreground uppercase">Contact</h2>
              <ul className="text-muted-foreground">
                <li className="mb-2">
                  <Link to="/contact" className="hover:underline hover:text-primary transition-colors">Contact Us</Link>
                </li>
                <li className="mb-2">
                  <Link to="/terms" className="hover:underline hover:text-primary transition-colors">Terms of Service</Link>
                </li>
                <li className="mb-2">
                  <Link to="/privacy" className="hover:underline hover:text-primary transition-colors">Privacy Policy</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-border" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground">© {currentYear} WISS Forum. All Rights Reserved.</span>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <span className="sr-only">GitHub</span>
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 