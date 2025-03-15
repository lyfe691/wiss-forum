import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  // If there are less than 2 pages, don't render pagination
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate range around current page
    const leftSibling = Math.max(2, currentPage - siblingCount);
    const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount);
    
    // Add dots if there's a gap after first page
    if (leftSibling > 2) {
      pageNumbers.push(-1); // -1 represents dots
    }
    
    // Add pages around current page
    for (let i = leftSibling; i <= rightSibling; i++) {
      pageNumbers.push(i);
    }
    
    // Add dots if there's a gap before last page
    if (rightSibling < totalPages - 1) {
      pageNumbers.push(-2); // -2 represents dots (different key from first dots)
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-center space-x-1">
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>
      
      {pageNumbers.map((pageNumber, index) => {
        // Render dots
        if (pageNumber < 0) {
          return (
            <span 
              key={`dots-${pageNumber}`} 
              className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }
        
        // Render page number
        return (
          <Button
            key={`page-${pageNumber}`}
            variant={pageNumber === currentPage ? "default" : "outline"}
            size="sm"
            className="h-8 w-8"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
            <span className="sr-only">Page {pageNumber}</span>
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </nav>
  );
} 