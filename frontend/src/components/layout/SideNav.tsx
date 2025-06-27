import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Home,
  Users,
  Book,
  Settings,
  User,
  HelpCircle,
  FileText,
  ChevronRight,
  Bookmark,
  LayoutDashboard,
  Medal
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Role, roleUtils } from '@/lib/types';

// App version from package
import pkg from "../../../package.json" with { type: "json" };
const APP_VERSION: string = (pkg as { version: string }).version;

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
  badge?: number | string;
  itemRef?: React.RefObject<HTMLDivElement | null>;
}

const NavItem = ({ icon, label, href, isActive, isMobile, onClick, badge, itemRef }: NavItemProps) => {
  if (isMobile) {
    return (
      <Link to={href} onClick={onClick} className="w-full">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-11 rounded-lg transition-colors duration-200",
            isActive 
              ? "text-primary font-medium bg-primary/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <span className="flex items-center justify-center mr-3">
            {icon}
          </span>
          <span className="flex-1 text-left">{label}</span>
          {badge && (
            <span className="bg-primary text-primary-foreground text-xs font-medium rounded-full px-2 py-0.5 min-w-5 text-center">
              {badge}
            </span>
          )}
          <ChevronRight className="h-4 w-4 opacity-50" />
        </Button>
      </Link>
    );
  }

  // Desktop NavItem - Clean and minimal
  return (
    <div ref={itemRef} className="relative w-full px-2" data-nav-item={href}>
      <Link to={href} onClick={onClick} className="w-full block">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 font-normal relative rounded-lg py-2.5 h-10 transition-colors duration-200",
            isActive 
              ? "text-primary font-medium bg-primary/10 hover:bg-primary/15"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <span className={cn(
            "flex items-center justify-center w-5 h-5",
            isActive ? "text-primary" : "text-muted-foreground"
          )}>
            {icon}
          </span>
          <span className={isActive ? "text-primary" : ""}>
            {label}
          </span>
          {badge && (
            <span className="ml-auto bg-primary text-primary-foreground text-xs font-medium rounded-full px-2 py-0.5 min-w-5 text-center">
              {badge}
            </span>
          )}
        </Button>
      </Link>
    </div>
  );
};

interface SideNavProps {
  isMobileSidebar?: boolean;
  onItemClick?: () => void;
}

export function SideNav({ isMobileSidebar = false, onItemClick }: SideNavProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState<{
    top: number;
    height: number;
    opacity: number;
  }>({ top: 0, height: 0, opacity: 0 });
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navItemRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({});

  useEffect(() => {
    if (isMobileSidebar) return; 

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [isMobileSidebar]);

  // Update active indicator position
  useEffect(() => {
    if (isMobile || isMobileSidebar) return;

    const updateIndicatorPosition = () => {
      const activeNavItem = Object.entries(navItemRefs.current).find(([href]) => {
        const isExactMatch = location.pathname === href;
        const isParentPath = href !== '/' && location.pathname.startsWith(href);
        const excludeFromParentHighlight = 
          (href === '/admin' && (
            location.pathname === '/admin/users' || 
            location.pathname === '/admin/categories'
          ));
        
        return isExactMatch || (isParentPath && !excludeFromParentHighlight);
      });

      if (activeNavItem && activeNavItem[1].current && sidebarRef.current) {
        const activeElement = activeNavItem[1].current;
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();
        
        const relativeTop = activeRect.top - sidebarRect.top;
        
        setActiveIndicatorStyle({
          top: relativeTop,
          height: activeRect.height,
          opacity: 1
        });
      } else {
        setActiveIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(updateIndicatorPosition, 50);
    
    // Update on window resize
    window.addEventListener('resize', updateIndicatorPosition);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicatorPosition);
    };
  }, [location.pathname, isMobile, isMobileSidebar]);
  
  // Get user role and permissions
  const userRole = roleUtils.normalizeRole(user?.role);
  const isAdmin = userRole === Role.ADMIN;
  const isTeacher = userRole === Role.TEACHER;

  // Helper function to create refs for nav items
  const createNavItemRef = (href: string) => {
    if (!navItemRefs.current[href]) {
      navItemRefs.current[href] = React.createRef<HTMLDivElement>();
    }
    return navItemRefs.current[href];
  };

  // Main navigation items
  const navItems = [
    {
      icon: <Home className="h-4 w-4" />,
      label: "Home",
      href: "/"
    },
    {
      icon: <Bookmark className="h-4 w-4" />,
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
      label: "Community",
      href: "/users"
    },
    {
      icon: <Medal className="h-4 w-4" />,
      label: "Leaderboard",
      href: "/leaderboard"
    }
  ];
  
  // User navigation items
  const userNavItems = isAuthenticated ? [
    {
      icon: <User className="h-4 w-4" />,
      label: "Profile",
      href: "/profile"
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: "Settings",
      href: "/settings"
    }
  ] : [];
  
  // Admin navigation items
  const adminNavItems = (() => {
    if (!isAuthenticated) return [];
    
    if (isAdmin) {
      return [
        {
          icon: <LayoutDashboard className="h-4 w-4" />,
          label: "Dashboard",
          href: "/admin"
        },
        {
          icon: <Book className="h-4 w-4" />,
          label: "Categories",
          href: "/admin/categories"
        },
        {
          icon: <Users className="h-4 w-4" />,
          label: "Users",
          href: "/admin/users"
        }
      ];
    }
    
    if (isTeacher) {
      return [
        {
          icon: <Book className="h-4 w-4" />,
          label: "Categories",
          href: "/admin/categories"
        }
      ];
    }
    
    return [];
  })();

  // Help navigation items
  const helpNavItems = [
    {
      icon: <HelpCircle className="h-4 w-4" />,
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
      const isExactMatch = location.pathname === item.href;
      const isParentPath = item.href !== '/' && location.pathname.startsWith(item.href);
      
      const excludeFromParentHighlight = 
        (item.href === '/admin' && (
          location.pathname === '/admin/users' || 
          location.pathname === '/admin/categories'
        ));
      
      const isActive = isExactMatch || (isParentPath && !excludeFromParentHighlight);
      
      return (
        <NavItem
          key={`${item.href}-${index}`}
          icon={item.icon}
          label={item.label}
          href={item.href}
          isActive={isActive}
          isMobile={isMobileSidebar}
          onClick={handleItemClick}
          badge={item.badge}
          itemRef={!isMobileSidebar ? createNavItemRef(item.href) : undefined}
        />
      );
    });
  };

  const NavSection = ({ title, items }: { title: string; items: any[] }) => (
    <div className="px-3 space-y-1">
      <div className={cn(
        "px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground/80 mb-2",
        isMobileSidebar && "text-sm font-medium normal-case"
      )}>
        {title}
      </div>
      {renderNavItems(items)}
    </div>
  );

  const sidebarContent = (
    <div ref={sidebarRef} className="h-full flex flex-col bg-card relative">
      {/* Active Indicator Tracer - clean and subtle */}
      {!isMobile && !isMobileSidebar && (
        <div
          className="absolute left-2 w-0.5 bg-primary/80 rounded-full transition-all duration-300 ease-out z-10"
          style={{
            top: `${activeIndicatorStyle.top + 8}px`,
            height: `${activeIndicatorStyle.height - 16}px`,
            opacity: activeIndicatorStyle.opacity,
          }}
        />
      )}
      
      <ScrollArea className="flex-1 py-4">
        <NavSection title="Main" items={navItems} />
        
        {(userNavItems.length > 0 || adminNavItems.length > 0) && (
          <>
            <Separator className="my-4 mx-6" />
            
            {userNavItems.length > 0 && (
              <NavSection title="Account" items={userNavItems} />
            )}
            
            {adminNavItems.length > 0 && (
              <div className="mt-4">
                <NavSection title="Admin" items={adminNavItems} />
              </div>
            )}
          </>
        )}
        
        <Separator className="my-4 mx-6" />
        <NavSection title="Support" items={helpNavItems} />
      </ScrollArea>
      
      {/* Clean version footer */}
      <div className="px-6 py-3 border-t border-border/50 bg-muted/20">
        <span className="text-xs text-muted-foreground">
          WISS Forum v{APP_VERSION}
        </span>
      </div>
    </div>
  );

  // Mobile sidebar
  if (isMobileSidebar) {
    return sidebarContent;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border fixed top-16 bottom-0 z-30 bg-card">
          {sidebarContent}
        </aside>
      )}
      
      {/* Spacer for fixed sidebar */}
      {!isMobile && <div className="hidden lg:block w-64 shrink-0" />}
    </>
  );
} 