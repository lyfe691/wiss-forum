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
  ChevronRight,
  Bookmark,
  Bell,
  LayoutDashboard,
  ChevronLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { IconRight } from 'react-day-picker';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
  badge?: number | string;
}

const NavItem = ({ icon, label, href, isActive, isMobile, onClick, badge }: NavItemProps) => {
  if (isMobile) {
    return (
      <Link to={href} onClick={onClick} className="w-full">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            isActive ? "text-primary font-medium" : ""
          )}
        >
          <span className="flex items-center justify-center mr-3">{icon}</span>
          <span>{label}</span>
          {badge && (
            <span className="ml-auto bg-primary/15 text-primary text-xs font-medium rounded-full px-2 py-0.5 min-w-5 text-center">
              {badge}
            </span>
          )}
          <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
        </Button>
      </Link>
    );
  }

  return (
    <Link to={href} onClick={onClick} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 font-normal relative rounded-md",
          isActive 
            ? "bg-primary/10 text-primary hover:bg-primary/20 font-medium" 
            : "hover:bg-muted"
        )}
      >
        {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-primary rounded-full" />}
        <span className={cn("flex items-center justify-center", isActive ? "text-primary" : "text-muted-foreground")}>{icon}</span>
        <span className={isActive ? "text-primary" : ""}>{label}</span>
        {badge && (
          <span className="ml-auto bg-primary/15 text-primary text-xs font-medium rounded-full px-2 py-0.5 min-w-5 text-center">
            {badge}
          </span>
        )}
      </Button>
    </Link>
  );
};

interface SideNavProps {
  isMobileSidebar?: boolean;
  onItemClick?: () => void;
}

export function SideNav({ isMobileSidebar = false, onItemClick }: SideNavProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    if (isMobileSidebar) return; // Don't run resize detection if we're explicitly in mobile mode

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileSidebar]);
  
  const navItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Home",
      href: "/"
    },
    {
      icon: <Bookmark className="h-5 w-5" />,
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
      label: "Community",
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
      icon: <Bell className="h-5 w-5" />,
      label: "Notifications",
      href: "/notifications"
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/settings"
    }
  ] : [];
  
  const adminNavItems = isAuthenticated ? (
    user?.role === 'admin' ? [
      {
        icon: <LayoutDashboard className="h-5 w-5" />,
        label: "Dashboard",
        href: "/admin"
      },
      {
        icon: <Book className="h-5 w-5" />,
        label: "Categories",
        href: "/admin/categories"
      },
      {
        icon: <Users className="h-5 w-5" />,
        label: "Users",
        href: "/admin/users"
      }
    ] : user?.role === 'teacher' ? [
      {
        icon: <Book className="h-5 w-5" />,
        label: "Categories",
        href: "/admin/categories"
      }
    ] : []
  ) : [];
  const helpNavItems = [
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: "Help & FAQ",
      href: "/help"
    }
  ];

  const handleItemClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  const renderNavItems = (items: any[]) => {
    return items.map((item, index) => {
      // Special case for admin dashboard - don't highlight when on admin/users or admin/categories
      const isExactMatch = location.pathname === item.href;
      const isParentPath = item.href !== '/' && location.pathname.startsWith(item.href);
      
      // Exclude specific cases where we don't want parent highlighting
      const excludeFromParentHighlight = 
        (item.href === '/admin' && (
          location.pathname === '/admin/users' || 
          location.pathname === '/admin/categories'
        ));
      
      const isActive = isExactMatch || (isParentPath && !excludeFromParentHighlight);
      
      return (
        <NavItem
          key={index}
          icon={item.icon}
          label={item.label}
          href={item.href}
          isActive={isActive}
          isMobile={isMobileSidebar}
          onClick={handleItemClick}
          badge={item.badge}
        />
      );
    });
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-1">
          {isMobileSidebar ? (
            <h3 className="px-4 text-sm font-semibold text-muted-foreground mb-2">
              Navigation
            </h3>
          ) : (
            <div className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Main
            </div>
          )}
          {renderNavItems(navItems)}
        </div>
        
        {(userNavItems.length > 0 || adminNavItems.length > 0) && (
          <>
            <Separator className="my-4 opacity-50" />
            
            {userNavItems.length > 0 && (
              <div className="px-3 space-y-1">
                {isMobileSidebar ? (
                  <h3 className="px-4 text-sm font-semibold text-muted-foreground mb-2">
                    Account
                  </h3>
                ) : (
                  <div className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Account
                  </div>
                )}
                {renderNavItems(userNavItems)}
              </div>
            )}
            
            {adminNavItems.length > 0 && (
              <div className="px-3 space-y-1 mt-4">
                {isMobileSidebar ? (
                  <h3 className="px-4 text-sm font-semibold text-muted-foreground mb-2">
                    Administration
                  </h3>
                ) : (
                  <div className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Administration
                  </div>
                )}
                {renderNavItems(adminNavItems)}
              </div>
            )}
          </>
        )}
        
        <Separator className="my-4 opacity-50" />
        
        <div className="px-3 space-y-1">
          {isMobileSidebar ? (
            <h3 className="px-4 text-sm font-semibold text-muted-foreground mb-2">
              Support
            </h3>
          ) : (
            <div className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Support
            </div>
          )}
          {renderNavItems(helpNavItems)}
        </div>
      </ScrollArea>
      {/* Version Indicator */}
      <div className="px-6 py-3 border-t border-border mt-auto">
        <span className="text-xs text-muted-foreground">
          v1.0.0
        </span>
      </div>
    </div>
  );

  // If explicitly used as mobile sidebar, just return the content
  if (isMobileSidebar) {
    return sidebarContent;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r fixed top-16 bottom-0 z-30">
          {/* Logo Area - Removed from here, now part of Navbar logic */}
          
          {/* Navigation Area */}
          <div className="flex-1 overflow-y-auto bg-background/95 backdrop-blur-sm">
            {sidebarContent}
          </div>
        </aside>
      )}
      
      {/* Empty space to compensate for the fixed sidebar */}
      {!isMobile && <div className="hidden lg:block w-64 shrink-0" />}
    </>
  );
} 