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
  LayoutGrid,
  HelpCircle,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';

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

  // Navigation item groups
  const mainNavItems = [
    {
      icon: <Home className="h-4 w-4" />,
      label: "Home",
      href: "/"
    },
    {
      icon: <LayoutGrid className="h-4 w-4" />,
      label: "Categories",
      href: "/categories"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Latest Topics",
      href: "/topics/latest"
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Users",
      href: "/users"
    }
  ];

  const adminNavItems = isAuthenticated && (user?.role === 'admin' || user?.role === 'teacher') ? [
    {
      icon: <Book className="h-4 w-4" />,
      label: "Manage Categories",
      href: "/admin/categories"
    },
    ...(user?.role === 'admin' ? [
      {
        icon: <Users className="h-4 w-4" />,
        label: "Manage Users",
        href: "/admin/users"
      },
      {
        icon: <ShieldCheck className="h-4 w-4" />,
        label: "Admin Dashboard",
        href: "/admin"
      }
    ] : [])
  ] : [];

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
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                    isActivePath(item.href) 
                      ? "text-primary bg-primary/10"
                      : "text-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              {adminNavItems.length > 0 && (
                <>
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                        isActivePath(item.href) 
                          ? "text-primary bg-primary/10"
                          : "text-foreground hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="hidden md:flex md:items-center md:space-x-3">
                {/* Notifications */}
                <NotificationBell />
                
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
                  className="text-foreground hover:text-primary hover:bg-primary/5"
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
                <SheetContent className="border-l border-border w-[280px] sm:w-[350px] px-0">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center py-4 px-4 border-b border-border">
                      <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="font-bold">WISS Forum</span>
                      </Link>
                    </div>

                    {isAuthenticated && (
                      <div className="px-4 py-3 border-b border-border">
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
                      </div>
                    )}

                    <div className="flex-1 overflow-auto">
                      <div className="px-2 py-4">
                        <div className="mb-2 px-3">
                          <h3 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                            Navigation
                          </h3>
                        </div>
                        <nav className="flex flex-col space-y-1">
                          {mainNavItems.map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              className={cn(
                                "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                                isActivePath(item.href) 
                                  ? "text-primary bg-primary/10"
                                  : "text-foreground hover:text-primary hover:bg-primary/5"
                              )}
                              onClick={closeMobileMenu}
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </nav>
                      </div>

                      {isAuthenticated && (
                        <div className="px-2 py-3 border-t border-border">
                          <div className="mb-2 px-3">
                            <h3 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                              Account
                            </h3>
                          </div>
                          <nav className="flex flex-col space-y-1">
                            <Link
                              to="/profile"
                              className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2"
                              onClick={closeMobileMenu}
                            >
                              <User className="h-4 w-4" />
                              <span>Profile</span>
                            </Link>
                            <Link
                              to="/settings"
                              className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2"
                              onClick={closeMobileMenu}
                            >
                              <Settings className="h-4 w-4" />
                              <span>Settings</span>
                            </Link>
                          </nav>
                        </div>
                      )}

                      {adminNavItems.length > 0 && (
                        <div className="px-2 py-3 border-t border-border">
                          <div className="mb-2 px-3">
                            <h3 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                              Administration
                            </h3>
                          </div>
                          <nav className="flex flex-col space-y-1">
                            {adminNavItems.map((item) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                  "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                                  isActivePath(item.href) 
                                    ? "text-primary bg-primary/10"
                                    : "text-foreground hover:text-primary hover:bg-primary/5"
                                )}
                                onClick={closeMobileMenu}
                              >
                                {item.icon}
                                <span>{item.label}</span>
                              </Link>
                            ))}
                          </nav>
                        </div>
                      )}

                      <div className="px-2 py-3 border-t border-border">
                        <div className="mb-2 px-3">
                          <h3 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                            Support
                          </h3>
                        </div>
                        <nav className="flex flex-col space-y-1">
                          <Link
                            to="/help"
                            className="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2"
                            onClick={closeMobileMenu}
                          >
                            <HelpCircle className="h-4 w-4" />
                            <span>Help & FAQ</span>
                          </Link>
                        </nav>
                      </div>
                    </div>

                    <div className="border-t border-border p-4">
                      {isAuthenticated ? (
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => {
                            handleLogout();
                            closeMobileMenu();
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
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