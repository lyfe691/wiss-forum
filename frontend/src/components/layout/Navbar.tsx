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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Bell,
  MessageSquare,

} from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { SideNav } from './SideNav';

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


  return (
    <header className={cn(
      "bg-background border-b border-border transition-all duration-200",
      scrolled ? "shadow-md" : "shadow-sm"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-1 flex items-center">
            {/* Mobile Sidebar */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              {/* Mobile Menu Button - Only visible on mobile */}
              <SheetTrigger asChild className="lg:hidden mr-2">
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              
              <SheetContent side="left" className="p-0 w-[280px]" hideCloseButton>
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-xl font-bold">WISS Forum</span>
                    </Link>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close menu</span>
                      </Button>
                    </SheetClose>
                  </div>

                  {/* Use mobile version of SideNav */}
                  <div className="flex-1 overflow-y-auto">
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
                    
                    {/* Render mobile nav (we'll add a mobile prop to SideNav) */}
                    <SideNav isMobileSidebar={true} onItemClick={closeMobileMenu} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 relative group">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold group-hover:text-primary transition-colors duration-200">WISS Forum</span>
            </Link>
          </div>
          
          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
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
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.displayName || user?.username}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/notifications" className="cursor-pointer">
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifications</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 