import * as React from "react";

export interface BreadcrumbProps {
  children: React.ReactNode;
  className?: string;
}

export const Breadcrumb = ({
  children,
  className,
  ...props
}: BreadcrumbProps) => {
  return (
    <nav
      className={`flex items-center space-x-1 text-sm text-muted-foreground ${className || ""}`}
      {...props}
    >
      {children}
    </nav>
  );
};

export interface BreadcrumbItemProps {
  children: React.ReactNode;
  className?: string;
}

export const BreadcrumbItem = ({
  children,
  className,
  ...props
}: BreadcrumbItemProps) => {
  return (
    <div className={`flex items-center ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

export interface BreadcrumbLinkProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  [key: string]: any;
}

export const BreadcrumbLink = ({
  children,
  className,
  as: Component = "span",
  ...props
}: BreadcrumbLinkProps) => {
  return (
    <Component
      className={`hover:text-foreground ${className || ""}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export const BreadcrumbSeparator = ({
  children = "/",
  className,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <span className={className} {...props}>
      {children}
    </span>
  );
}; 