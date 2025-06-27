import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Github, AlertCircle, ExternalLink, Sun, Moon, Monitor } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-6 py-8 md:py-10 lg:px-8">
        {/* Main Footer Content */}
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                WISS Forum
              </span>
            </Link>
            <p className="text-sm leading-6 text-muted-foreground max-w-xs">
              Academic discussions and knowledge sharing for the WISS community.
            </p>
            
            {/* GitHub Links */}
            <div className="flex space-x-3">
              <a
                href="https://github.com/lyfe691/wiss-forum"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>Source</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href="https://github.com/lyfe691/wiss-forum/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Issues</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-10 grid grid-cols-2 gap-6 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-6">
              {/* Community */}
              <div>
                <h3 className="text-sm font-semibold text-foreground">Community</h3>
                <ul role="list" className="mt-4 space-y-3">
                  <li>
                    <Link 
                      to="/categories" 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Categories
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/topics/latest" 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Latest Topics
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/users" 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Members
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/leaderboard" 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Leaderboard
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Account */}
              <div className="mt-8 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">Account</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {isAuthenticated ? (
                    <>
                      <li>
                        <Link 
                          to="/profile" 
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/settings" 
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Settings
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link 
                          to="/login" 
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Sign In
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/register" 
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Sign Up
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-6">
              {/* Support */}
              <div>
                <h3 className="text-sm font-semibold text-foreground">Support</h3>
                <ul role="list" className="mt-4 space-y-3">
                  <li>
                    <Link 
                      to="/help" 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <a 
                      href="mailto:admin@wiss-edu.ch"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Contact Support
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div className="mt-8 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">Legal</h3>
                <ul role="list" className="mt-4 space-y-3">
                  <li>
                    <Link 
                      to="/terms" 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/privacy" 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-10 border-t border-border/40 pt-6 sm:mt-12 lg:mt-14">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
              © {currentYear} WISS Forum. Built for the WISS community.
            </p>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <div className="inline-flex items-center rounded-full border bg-background p-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`relative inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
                    theme === 'light'
                      ? 'bg-muted text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  aria-label="Switch to light theme"
                  title="Switch to light theme"
                >
                  <Sun size={14} strokeWidth={2} />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`relative inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-muted text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  aria-label="Switch to dark theme"
                  title="Switch to dark theme"
                >
                  <Moon size={14} strokeWidth={2} />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`relative inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
                    theme === 'system'
                      ? 'bg-muted text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  aria-label="Switch to system theme"
                  title="Switch to system theme"
                >
                  <Monitor size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 