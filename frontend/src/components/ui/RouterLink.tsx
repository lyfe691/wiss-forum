import React from "react";
import { Link, LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface RouterLinkProps extends LinkProps {
  className?: string;
  children: React.ReactNode;
}

export const RouterLink = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        className={cn(className)}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

RouterLink.displayName = "RouterLink"; 