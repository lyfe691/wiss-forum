import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
import { Menu, X, User, LogOut, Settings, Book, Users } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary">WISS Forum</span>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link
                to="/"
                className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/categories"
                className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
              >
                Categories
              </Link>
              {isAuthenticated && user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={user?.avatar} alt={user?.displayName} />
                        <AvatarFallback>{user?.displayName ? getInitials(user.displayName) : 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.displayName}</p>
                        <p className="text-xs text-gray-500">@{user?.username}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    {(user?.role === 'admin' || user?.role === 'teacher') && (
                      <>
                        <DropdownMenuItem onClick={() => navigate('/admin/categories')}>
                          <Book className="mr-2 h-4 w-4" />
                          <span>Manage Categories</span>
                        </DropdownMenuItem>
                        {user?.role === 'admin' && (
                          <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Manage Users</span>
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex md:items-center md:space-x-4">
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Log in
                </Button>
                <Button onClick={() => navigate('/register')}>Sign up</Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center ml-4">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col pt-16">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-4 top-4 w-8 h-8 p-0"
                    onClick={closeMobileMenu}
                  >
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                  
                  <div className="flex flex-col space-y-4">
                    <Link 
                      to="/" 
                      className="text-lg font-medium py-2"
                      onClick={closeMobileMenu}
                    >
                      Home
                    </Link>
                    <Link 
                      to="/categories" 
                      className="text-lg font-medium py-2"
                      onClick={closeMobileMenu}
                    >
                      Categories
                    </Link>
                    {isAuthenticated && user?.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="text-lg font-medium py-2"
                        onClick={closeMobileMenu}
                      >
                        Admin
                      </Link>
                    )}
                  </div>

                  <div className="mt-auto">
                    {isAuthenticated ? (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex items-center mb-4">
                          <Avatar className="h-10 w-10 mr-4">
                            <AvatarImage src={user?.avatar} alt={user?.displayName} />
                            <AvatarFallback>
                              {user?.displayName ? getInitials(user.displayName) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user?.displayName}</p>
                            <p className="text-sm text-gray-500">@{user?.username}</p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-3">
                          <Button 
                            variant="ghost" 
                            className="justify-start"
                            onClick={() => {
                              navigate('/profile');
                              closeMobileMenu();
                            }}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="justify-start"
                            onClick={() => {
                              navigate('/settings');
                              closeMobileMenu();
                            }}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
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
                      <div className="flex flex-col space-y-3 border-t border-gray-200 pt-4 mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            navigate('/login');
                            closeMobileMenu();
                          }}
                        >
                          Log in
                        </Button>
                        <Button 
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
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 