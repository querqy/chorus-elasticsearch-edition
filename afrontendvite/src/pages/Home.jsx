import React, { useEffect } from "react";
import { useStore } from "../store/useStore";
import logo from "../assets/chorus-logo.png";
import Sidebar from "../components/layout/Sidebar";
import ProductGrid from "../components/product/ProductGrid";
import Pagination from "../components/layout/Pagination";

export default function Home() {
  const searchQuery = useStore((state) => state.searchQuery);
  const setSearchQuery = useStore((state) => state.setSearchQuery);
  const executeSearch = useStore((state) => state.executeSearch);
  const totalResults = useStore((state) => state.totalResults);

  const loadInitialData = useStore((state) => state.loadInitialData);
  const loading = useStore((state) => state.isLoading || state.loading);

  // Initial load
  useEffect(() => {
    if (loadInitialData) loadInitialData();
    else executeSearch();
  }, []);

  // Search-as-you-type (Debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      executeSearch();
    }, 300); // 300ms delay to prevent spamming backend

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, executeSearch]);

  if (loading && totalResults === 0) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white text-gray-900 font-sans">
      <header className="flex items-start p-6 gap-14 border-b border-gray-200">
        <div className="w-72 flex-shrink-0 flex justify-center">
          <img src={logo} alt="Chorus" className="h-16 w-auto object-contain" />
        </div>
        <div className="flex-1 flex justify-between items-start">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-2xl">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands or EAN"
                className="w-full border border-gray-300 rounded pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {totalResults || 0} results found
            </div>
          </div>
          <div className="flex-shrink-0 text-right text-xs text-gray-500 flex flex-col items-end gap-1 ml-4">
            <p>Your Client ID: CLIENT-195314eb...</p>
            <p>Your Session ID: SESSION-20e0780d...</p>
            <div className="flex items-center gap-2 mt-1">
              <span>Your 🛒 Items:</span>
              <span className="bg-gray-100 border border-gray-300 px-2 py-0.5 rounded">
                No items in cart
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row p-6 gap-14 flex-grow overflow-hidden">
        <aside className="w-full md:w-72 flex-shrink-0 sticky top-4 self-start">
          <Sidebar />
        </aside>

        {/* 1. Changed p-4 to pt-4 px-4 pb-2 to reduce bottom padding */}
        <main className="flex-1 flex flex-col h-full overflow-hidden border border-gray-200 rounded-lg pt-4 px-4 pb-2 shadow-sm bg-gray-50">
          {/* 2. Changed pb-4 to pb-2 */}
          <div className="flex-grow overflow-y-auto pr-2 pb-2">
            <ProductGrid />
          </div>

          {/* 3. Changed mt-8 to mt-2, and pt-6 to pt-3 */}
          <div className="mt-2 flex justify-center border-t border-gray-200 pt-3">
            <Pagination />
          </div>
        </main>
      </div>
    </div>
  );
}
