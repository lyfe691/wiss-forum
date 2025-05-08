import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
  isZeroBased?: boolean;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
  isZeroBased = true
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const displayPage = isZeroBased ? currentPage + 1 : currentPage;
  
  const getPageNumbers = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisible / 2);
    
    let startPage = Math.max(1, displayPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("ellipsis-start");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  
  const handlePageClick = (page: number) => {
    const internalPage = isZeroBased ? page - 1 : page;
    onPageChange(internalPage);
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => displayPage > 1 && handlePageClick(displayPage - 1)}
            style={{ cursor: displayPage === 1 ? "not-allowed" : "pointer", opacity: displayPage === 1 ? 0.5 : 1 }}
          />
        </PaginationItem>

        {pageNumbers.map((page, index) => {
          if (page === "ellipsis-start" || page === "ellipsis-end") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={index}>
              <PaginationLink
                isActive={page === displayPage}
                onClick={() => handlePageClick(page as number)}
                style={{ cursor: "pointer" }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            onClick={() => displayPage < totalPages && handlePageClick(displayPage + 1)}
            style={{ cursor: displayPage === totalPages ? "not-allowed" : "pointer", opacity: displayPage === totalPages ? 0.5 : 1 }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
} 