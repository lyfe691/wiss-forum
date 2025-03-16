import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { motion } from "framer-motion";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  maxVisible?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  maxVisible = 5,
}: PaginationProps) {
  // Ensure current page is valid
  const page = Math.max(1, Math.min(currentPage, totalPages));

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    if (totalPages <= maxVisible) {
      // Show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first and last page
    const pages = [1];
    
    // Calculate start and end of visible page range
    let startPage = Math.max(2, page - Math.floor((maxVisible - 3) / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 4);
    
    // Adjust if we're at the end
    if (endPage === totalPages - 1) {
      startPage = Math.max(2, endPage - (maxVisible - 4));
    }
    
    // Add ellipsis if needed at start
    if (startPage > 2) {
      pages.push(-1); // -1 represents ellipsis
    }
    
    // Add visible page range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed at end
    if (endPage < totalPages - 1) {
      pages.push(-2); // -2 represents ellipsis at end
    }
    
    // Add last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex justify-center", className)}
    >
      <ul className="flex items-center gap-1">
        <li>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 rounded-md"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </li>
        
        {pageNumbers.map((pageNum, i) => (
          <li key={`${pageNum}-${i}`}>
            {pageNum < 0 ? (
              <span className="flex h-9 w-9 items-center justify-center text-sm">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <motion.div
                initial={{ opacity: 0.8, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-9 w-9 rounded-md text-sm font-medium",
                    pageNum === page && "pointer-events-none"
                  )}
                  onClick={() => onPageChange(pageNum)}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={pageNum === page ? "page" : undefined}
                >
                  {pageNum}
                </Button>
              </motion.div>
            )}
          </li>
        ))}
        
        <li>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 rounded-md"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => onPageChange(page + 1)}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </li>
      </ul>
    </nav>
  );
} 