import { create } from "zustand";
import { fetchProducts } from "../services/api";

export const useStore = create((set, get) => ({
  products: [],
  totalResults: 0,
  typeAggs: [],
  searchQuery: "",
  selectedAlgo: "default",
  selectedSubConfig: "", // For "Other Config" sub-menu
  selectedTypes: [],
  currentPage: 1,
  isLoading: false,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setAlgo: (algo) => {
    set({ selectedAlgo: algo, selectedSubConfig: "", currentPage: 1 });
    get().executeSearch();
  },

  setSubConfig: (subConfig) => {
    set({ selectedSubConfig: subConfig, currentPage: 1 });
    get().executeSearch();
  },

  setPage: (page) => {
    set({ currentPage: page });
    get().executeSearch();
  },

  toggleType: (type) => {
    const currentTypes = get().selectedTypes;
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    set({ selectedTypes: newTypes, currentPage: 1 });
    get().executeSearch();
  },

  executeSearch: async () => {
    set({ isLoading: true });
    const state = get();

    // Determine target algo strategy based on both selectors
    const effectiveAlgo =
      state.selectedAlgo === "other_config" && state.selectedSubConfig
        ? state.selectedSubConfig
        : state.selectedAlgo;

    const data = await fetchProducts({
      searchTerm: state.searchQuery,
      page: state.currentPage,
      algo: effectiveAlgo,
      types: state.selectedTypes,
    });

    set({
      products: data.products,
      totalResults: data.totalResults,
      typeAggs: data.typeAggs,
      isLoading: false,
    });
  },

  loadInitialData: () => {
    get().executeSearch();
  },
}));
