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
  Search,
  Plus,
  Shield
} from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { SideNav } from './SideNav';
import { Input } from '@/components/ui/input';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
      setSearchValue('');
    }
  };

  return (
    <header className={cn(
      "bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-200",
      scrolled ? "shadow-sm" : ""
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* Mobile Sidebar */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              {/* Mobile Menu Button - Only visible on mobile */}
              <SheetTrigger asChild className="lg:hidden mr-2">
                <Button variant="ghost" size="icon" className="lg:hidden relative text-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                  {isAuthenticated && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              
              <SheetContent side="left" className="p-0 w-[300px]" hideCloseButton>
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
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
                      <div className="px-4 py-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-primary/20">
                            <AvatarImage src={user?.avatar} alt={user?.displayName} />
                            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                              {user?.displayName ? getInitials(user.displayName) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user?.displayName || user?.username}</p>
                            <div className="inline-flex mt-1">
                              <span className="text-xs font-medium px-1.5 py-0.5 rounded-sm bg-primary/15 text-primary">
                                {user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick actions */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                            <Link to="/profile" onClick={closeMobileMenu}>
                              <User className="mr-2 h-4 w-4" />
                              Profile
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                            <Link to="/notifications" onClick={closeMobileMenu}>
                              <Bell className="mr-2 h-4 w-4" />
                              Notifications
                            </Link>
                          </Button>
                        </div>
                        
                        {/* Create post button */}
                        <Button className="w-full mt-3" size="sm" asChild>
                          <Link to="/create-topic" onClick={closeMobileMenu}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Post
                          </Link>
                        </Button>
                      </div>
                    )}
                    
                    {/* Render mobile nav */}
                    <SideNav isMobileSidebar={true} onItemClick={closeMobileMenu} />
                  </div>
                  
                  {isAuthenticated && (
                    <div className="mt-auto p-4 border-t">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          closeMobileMenu();
                          handleLogout();
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 relative group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground group-hover:bg-primary/90 transition-colors duration-200">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold group-hover:text-primary transition-colors duration-200">WISS Forum</span>
            </Link>
          </div>

          {/* Search bar - only on desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex mx-4 flex-1 max-w-md relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search topics, categories, users..."
                className="pl-10 pr-4 w-full bg-muted/40 border-muted focus-visible:bg-background"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </form>
          
          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Create Post button - desktop only */}
                <Button size="sm" asChild className="hidden sm:flex mr-2">
                  <Link to="/create-topic">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Post
                  </Link>
                </Button>
                
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
                        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
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
                    
                    {user?.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
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
                <Button variant="ghost" asChild className="text-sm font-medium">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile search - only visible on small screens */}
      <div className="lg:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 pr-4 w-full bg-muted/40 border-muted"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>
      </div>
    </header>
  );
} 