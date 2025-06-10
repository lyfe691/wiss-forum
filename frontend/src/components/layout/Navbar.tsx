import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { getAvatarUrl } from '@/lib/utils';
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
  Plus,
  Shield,
  Book
} from 'lucide-react';
import { SideNav } from './SideNav';
import { getRoleBadgeColor, formatRoleName } from '@/lib/utils';
import { Role, roleUtils } from '@/lib/types';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // detect scroll for navbar appearsance change
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

  // Get user role and check permissions
  const userRole = roleUtils.normalizeRole(user?.role);
  const isAdmin = userRole === Role.ADMIN;
  const isTeacher = userRole === Role.TEACHER;

  // Get logo based on theme
  const getLogoPath = () => {
    if (theme === 'light') return '/logo-light.png';
    if (theme === 'dark') return '/logo-dark.png';
    
    // For system theme, detect actual applied theme
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDarkMode ? '/logo-dark.png' : '/logo-light.png';
  };


  return (
    <header className={cn(
      "bg-muted/30 backdrop-blur-sm border-b border-border transition-all duration-200",
      scrolled ? "shadow-sm" : ""
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* left side: logo (desktop) + mobile menu toggle */}
          <div className="flex items-center">
            {/* logo - fixed position on desktop */}
            <div className="hidden lg:flex items-center justify-center w-64 border-r fixed top-0 left-0 h-16 bg-muted/30 backdrop-blur-sm z-50">
              <Link to="/">
                <img src={getLogoPath()} alt="WISS Forum Logo" className=" h-25 w-auto" />
              </Link>
            </div>

            {/* mobile menu button */} 
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden mr-2">
                <Button variant="ghost" size="icon" className="lg:hidden relative text-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              
              <SheetContent side="left" className="p-0 w-[280px]" hideCloseButton>
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b flex items-center justify-between bg-muted/30 backdrop-blur-sm">
                    <Link to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                      <img src={getLogoPath()} alt="WISS Forum Logo" className="h-25 w-auto" />
                    </Link>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close menu</span>
                      </Button>
                    </SheetClose>
                  </div>

                  {/* use mobile version of sidenav */}
                  <div className="flex-1 overflow-y-auto bg-muted/30">
                    {isAuthenticated && (
                      <div className="px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-primary/20">
                            <AvatarImage src={getAvatarUrl(user?._id || 'user', user?.avatar)} alt={user?.displayName} />
                            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                              {user?.displayName ? getInitials(user.displayName) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user?.displayName || user?.username}</p>
                            <div className="inline-flex mt-1">
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-sm ${getRoleBadgeColor(user?.role || '')}`}>
                                {user?.role ? formatRoleName(user.role) : 'User'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* render mobile nav */}
                    <SideNav isMobileSidebar={true} onItemClick={closeMobileMenu} />
                  </div>
                  
                  {isAuthenticated && (
                    <div className="mt-auto p-4 border-t bg-muted/30 backdrop-blur-sm">
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
          </div>
          
          {/* right side controls */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* create post button - desktop only */}
                <Button size="sm" asChild className="hidden sm:flex mr-3 shadow-sm hover:shadow transition-all duration-200">
                  <Link to="/create-topic">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Post
                  </Link>
                </Button>
                
                {/* user profile dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-11 rounded-xl flex items-center gap-3 pl-1.5 pr-4 transition-all duration-200 hover:bg-primary/5 hover:shadow-sm border border-transparent hover:border-primary/10"
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8 border-2 border-primary/20 shadow-sm">
                          <AvatarImage src={getAvatarUrl(user?._id || 'user', user?.avatar)} alt={user?.displayName} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-medium text-sm">
                            {user?.displayName ? getInitials(user.displayName) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {/* Online status indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                      </div>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-medium max-w-[120px] truncate leading-tight">
                          {user?.displayName || user?.username}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 shadow-lg border-primary/10">
                    <DropdownMenuLabel className="p-0 mb-3">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/10">
                        <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
                          <AvatarImage src={getAvatarUrl(user?._id || 'user', user?.avatar)} alt={user?.displayName} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-medium">
                            {user?.displayName ? getInitials(user.displayName) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{user?.displayName || user?.username}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRoleBadgeColor(user?.role || '')}`}>
                              {user?.role ? formatRoleName(user.role) : 'User'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-2" />
                    
                    {/* Account Section */}
                    <div className="space-y-1">
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer rounded-lg hover:bg-primary/10 transition-colors">
                          <User className="mr-3 h-4 w-4 text-primary" />
                          <div className="flex-1">
                            <span className="font-medium">Profile</span>
                            <p className="text-xs text-muted-foreground">View and edit your profile</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="cursor-pointer rounded-lg hover:bg-primary/10 transition-colors">
                          <Settings className="mr-3 h-4 w-4 text-primary" />
                          <div className="flex-1">
                            <span className="font-medium">Settings</span>
                            <p className="text-xs text-muted-foreground">Account preferences</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                    
                    {/* Admin Section */}
                    {user && (roleUtils.hasAtLeastSamePrivilegesAs(roleUtils.normalizeRole(user.role), Role.ADMIN) || isTeacher) && (
                      <>
                        <DropdownMenuSeparator className="my-2" />
                        <div className="px-2 py-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Management</p>
                        </div>
                        <div className="space-y-1">
                          {user && roleUtils.hasAtLeastSamePrivilegesAs(roleUtils.normalizeRole(user.role), Role.ADMIN) && (
                            <DropdownMenuItem asChild>
                              <Link to="/admin" className="cursor-pointer rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors">
                                <Shield className="mr-3 h-4 w-4 text-amber-600" />
                                <div className="flex-1">
                                  <span className="font-medium">Admin Dashboard</span>
                                  <p className="text-xs text-muted-foreground">Full system control</p>
                                </div>
                              </Link>
                            </DropdownMenuItem>
                          )}
                          
                          {user && isTeacher && !isAdmin && (
                            <DropdownMenuItem asChild>
                              <Link to="/admin/categories" className="cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                                <Book className="mr-3 h-4 w-4 text-blue-600" />
                                <div className="flex-1">
                                  <span className="font-medium">Manage Categories</span>
                                  <p className="text-xs text-muted-foreground">Organize discussions</p>
                                </div>
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </div>
                      </>
                    )}
                    
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer rounded-lg hover:bg-destructive/10 transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <div className="flex-1">
                        <span className="font-medium">Sign out</span>
                        <p className="text-xs text-muted-foreground">End your session</p>
                      </div>
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
    </header>
  );
} 