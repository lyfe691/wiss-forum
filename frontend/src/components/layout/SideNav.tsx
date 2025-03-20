import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  MessageSquare,
  Users,
  Book,
  Settings,
  User,
  HelpCircle,
  FileText,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, href, isActive, isMobile, onClick }: NavItemProps) => {
  return (
    <Link to={href} onClick={onClick} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 font-normal",
          isActive 
            ? "bg-primary/10 text-primary hover:bg-primary/20" 
            : "hover:bg-muted",
          isMobile && "text-base py-6"
        )}
      >
        {icon}
        <span>{label}</span>
        {isMobile && <ChevronRight className="ml-auto h-4 w-4 opacity-60" />}
      </Button>
    </Link>
  );
};

export function SideNav() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const navItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Home",
      href: "/"
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Categories",
      href: "/categories"
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Latest Topics",
      href: "/topics/latest"
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Users",
      href: "/users"
    }
  ];
  
  const userNavItems = isAuthenticated ? [
    {
      icon: <User className="h-5 w-5" />,
      label: "Profile",
      href: "/profile"
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/settings"
    }
  ] : [];
  
  const adminNavItems = isAuthenticated && (user?.role === 'admin' || user?.role === 'teacher') ? [
    {
      icon: <Book className="h-5 w-5" />,
      label: "Manage Categories",
      href: "/admin/categories"
    },
    ...(user?.role === 'admin' ? [
      {
        icon: <Users className="h-5 w-5" />,
        label: "Manage Users",
        href: "/admin/users"
      },
      {
        icon: <ShieldCheck className="h-5 w-5" />,
        label: "Admin Dashboard",
        href: "/admin"
      }
    ] : [])
  ] : [];
  
  const helpNavItems = [
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: "Help & FAQ",
      href: "/help"
    }
  ];

  const renderNavItems = (items: any[]) => {
    return items.map((item, index) => (
      <NavItem
        key={index}
        icon={item.icon}
        label={item.label}
        href={item.href}
        isActive={location.pathname === item.href}
      />
    ));
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 py-6">
        <div className="px-3 space-y-1">
          {renderNavItems(navItems)}
        </div>
        
        {(userNavItems.length > 0 || adminNavItems.length > 0) && (
          <>
            <Separator className="my-4" />
            
            {userNavItems.length > 0 && (
              <div className="px-3 space-y-1">
                <h3 className="px-4 text-sm font-semibold text-muted-foreground mb-2">
                  User
                </h3>
                {renderNavItems(userNavItems)}
              </div>
            )}
            
            {adminNavItems.length > 0 && (
              <div className="px-3 space-y-1 mt-4">
                <h3 className="px-4 text-sm font-semibold text-muted-foreground mb-2">
                  Administration
                </h3>
                {renderNavItems(adminNavItems)}
              </div>
            )}
          </>
        )}
        
        <Separator className="my-4" />
        
        <div className="px-3 space-y-1">
          <h3 className="px-4 text-sm font-semibold text-muted-foreground mb-2">
            Support
          </h3>
          {renderNavItems(helpNavItems)}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="hidden lg:block w-64 shrink-0 border-r fixed top-16 bottom-0 overflow-hidden z-40">
          {sidebarContent}
        </aside>
      )}
      
      {/* Empty space to compensate for the fixed sidebar */}
      {!isMobile && <div className="hidden lg:block w-64 shrink-0" />}
    </>
  );
} 