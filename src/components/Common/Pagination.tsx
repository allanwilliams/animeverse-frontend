'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate pages: current, current+1, current+2
  const pages = [];
  const endPage = Math.min(totalPages, currentPage + 2);
  
  for (let i = currentPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Check if we need to show ellipsis and last page
  // Show ellipsis if there's a gap between endPage and totalPages
  const showEllipsis = endPage < totalPages - 1;
  const showLastPage = endPage < totalPages;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        aria-label="Página anterior"
      >
        Anterior
      </button>

      {/* Page Numbers: current, current+1, current+2 */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
            page === currentPage
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Show ellipsis if there's a gap */}
      {showEllipsis && (
        <span className="text-gray-400 px-2">...</span>
      )}

      {/* Show last page if it's not already in the pages array */}
      {showLastPage && (
        <button
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          {totalPages}
        </button>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        aria-label="Próxima página"
      >
        Próxima
      </button>
    </div>
  );
}

