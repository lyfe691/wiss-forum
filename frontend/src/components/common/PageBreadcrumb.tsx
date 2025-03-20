import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function PageBreadcrumb({ items, className = '' }: PageBreadcrumbProps) {
  if (!items || items.length === 0) return null;

  // Check if Home is already included in the items
  const hasHome = items.some(item => item.label === 'Home' && item.href === '/');

  return (
    <Breadcrumb className={`mb-6 ${className}`}>
      <BreadcrumbList>
        {/* Add Home link only if it's not already in the items */}
        {!hasHome && (
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        
        {/* Map through all items */}
        {items.map((item, index) => (
          <React.Fragment key={`${item.label}-${index}`}>
            {/* Only add separator after first item or if Home is already included */}
            {(index > 0 || (!hasHome && index === 0)) && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.isCurrentPage || !item.href ? (
                <BreadcrumbLink className="font-medium text-foreground">
                  {item.label}
                </BreadcrumbLink>
              ) : (
                <BreadcrumbLink asChild>
                  <Link 
                    to={item.href} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 