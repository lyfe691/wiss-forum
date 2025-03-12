import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Book, 
  Users, 
  Bell,
  MessageSquare,
  Home,
  LayoutGrid
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for navbar appearance change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path);
  }

  return (
    <header className={cn(
      "bg-background border-b border-border transition-all duration-200",
      scrolled ? "shadow-md" : "shadow-sm"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 relative group">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold group-hover:text-primary transition-colors duration-200">WISS Forum</span>
            </Link>
            
            <nav className="hidden md:ml-10 md:flex md:items-center md:space-x-1">
              <Link
                to="/"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  isActivePath('/') 
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/categories"
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  isActivePath('/categories') 
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Categories</span>
              </Link>
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                    isActivePath('/admin') 
                      ? "text-primary bg-primary/10"
                      : "text-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="hidden md:flex md:items-center md:space-x-3">
                {/* Notifications - example UI only */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-9 h-9 rounded-full relative p-0"
                  onClick={() => navigate('/notifications')}
                >
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-primary"></span>
                </Button>
                
                {/* User profile dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 rounded-full flex items-center gap-2 pl-1 pr-3 transition-all duration-200 hover:bg-primary/5"
                    >
                      <Avatar className="h-8 w-8 border border-primary/20">
                        <AvatarImage src={user?.avatar} alt={user?.displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user?.displayName ? getInitials(user.displayName) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium max-w-[100px] truncate hidden sm:block">
                        {user?.displayName || user?.username}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2">
                    <div className="flex items-start gap-4 p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatar} alt={user?.displayName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user?.displayName ? getInitials(user.displayName) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{user?.username}</p>
                        <div className="inline-flex mt-1">
                          <span className="text-xs font-medium px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuSeparator />
                    
                    <div className="p-1">
                      <DropdownMenuItem 
                        onClick={() => navigate('/profile')}
                        className="cursor-pointer flex items-center gap-2 py-2"
                      >
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      
                      {(user?.role === 'admin' || user?.role === 'teacher') && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => navigate('/admin/categories')}
                            className="cursor-pointer flex items-center gap-2 py-2"
                          >
                            <Book className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Manage Categories</span>
                          </DropdownMenuItem>
                          
                          {user?.role === 'admin' && (
                            <DropdownMenuItem 
                              onClick={() => navigate('/admin/users')}
                              className="cursor-pointer flex items-center gap-2 py-2"
                            >
                              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>Manage Users</span>
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      
                      <DropdownMenuItem 
                        onClick={() => navigate('/settings')}
                        className="cursor-pointer flex items-center gap-2 py-2"
                      >
                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    <div className="p-1">
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="cursor-pointer flex items-center gap-2 py-2 text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex md:items-center md:space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                  className="text-gray-700 hover:text-primary hover:bg-primary/5"
                >
                  Log in
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Sign up
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 p-0 border-0"
                    onClick={() => setIsMobileMenuOpen(true)}
                  >
                    <Menu className="h-5 w-5 text-foreground" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="border-l border-border">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between py-4 border-b border-border">
                      <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="font-bold">WISS Forum</span>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <X className="h-5 w-5 text-foreground" />
                      </Button>
                    </div>

                    <nav className="flex-1 py-6">
                      <div className="flex flex-col space-y-1">
                        <Link
                          to="/"
                          className={cn(
                            "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                            isActivePath('/') 
                              ? "text-primary bg-primary/10"
                              : "text-foreground hover:text-primary hover:bg-primary/5"
                          )}
                          onClick={closeMobileMenu}
                        >
                          <Home className="h-4 w-4" />
                          <span>Home</span>
                        </Link>
                        <Link
                          to="/categories"
                          className={cn(
                            "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                            isActivePath('/categories') 
                              ? "text-primary bg-primary/10"
                              : "text-foreground hover:text-primary hover:bg-primary/5"
                          )}
                          onClick={closeMobileMenu}
                        >
                          <LayoutGrid className="h-4 w-4" />
                          <span>Categories</span>
                        </Link>
                        {isAuthenticated && user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            className={cn(
                              "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                              isActivePath('/admin') 
                                ? "text-primary bg-primary/10"
                                : "text-foreground hover:text-primary hover:bg-primary/5"
                            )}
                            onClick={closeMobileMenu}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Admin</span>
                          </Link>
                        )}
                      </div>
                    </nav>

                    <div className="border-t border-border py-4">
                      {isAuthenticated ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-primary/20">
                              <AvatarImage src={user?.avatar} alt={user?.displayName} />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {user?.displayName ? getInitials(user.displayName) : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{user?.displayName || user?.username}</p>
                              <div className="inline-flex mt-1">
                                <span className="text-xs font-medium px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary">
                                  {user?.role}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => {
                                navigate('/profile');
                                closeMobileMenu();
                              }}
                            >
                              <User className="mr-2 h-4 w-4 text-primary" />
                              Profile
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => {
                                navigate('/settings');
                                closeMobileMenu();
                              }}
                            >
                              <Settings className="mr-2 h-4 w-4 text-primary" />
                              Settings
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-destructive hover:text-destructive"
                              onClick={() => {
                                handleLogout();
                                closeMobileMenu();
                              }}
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              Log out
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <Button
                            onClick={() => {
                              navigate('/login');
                              closeMobileMenu();
                            }}
                          >
                            Log in
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              navigate('/register');
                              closeMobileMenu();
                            }}
                          >
                            Sign up
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 