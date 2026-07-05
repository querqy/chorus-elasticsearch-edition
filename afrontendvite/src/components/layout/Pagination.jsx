import React from 'react';
import { useStore } from '../../store/useStore';

export default function Pagination() {
  const currentPage = useStore((state) => state.currentPage) || 1;
  const setPage = useStore((state) => state.setPage);
  const totalResults = useStore((state) => state.totalResults) || 0;

  const totalPages = Math.ceil(totalResults / 20);

  // Generate up to 5 visible page numbers around the current page
  const getVisiblePages = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pages = getVisiblePages();

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 my-2">
      <button 
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-100 text-gray-400 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
      >
        Prev
      </button>
      
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => setPage(page)}
          className={`px-3 py-1 rounded text-sm border ${
            currentPage === page 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200 hover:border-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      <button 
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}