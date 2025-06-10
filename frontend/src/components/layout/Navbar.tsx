import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
                <img src="/logo.png" alt="WISS Forum Logo" className=" h-25 w-auto" />
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
                      <img src="/logo.png" alt="WISS Forum Logo" className="h-25 w-auto" />
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
                <Button size="sm" asChild className="hidden sm:flex mr-2">
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
                      className="relative h-10 rounded-full flex items-center gap-2 pl-1 pr-3 transition-all duration-200 hover:bg-primary/5"
                    >
                      <Avatar className="h-8 w-8 border border-primary/20">
                        <AvatarImage src={getAvatarUrl(user?._id || 'user', user?.avatar)} alt={user?.displayName} />
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
                    
                    {user && roleUtils.hasAtLeastSamePrivilegesAs(roleUtils.normalizeRole(user.role), Role.ADMIN) && (
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
                    
                    {/* show category management option directly for teachers */}
                    {user && isTeacher && !isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin/categories" className="cursor-pointer">
                            <Book className="mr-2 h-4 w-4" />
                            <span>Manage Categories</span>
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
    </header>
  );
} 