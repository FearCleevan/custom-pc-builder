import { Product } from '@/types/product';
import { create } from 'zustand';

interface CompareStore {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  clearProducts: () => void;
  isInCompare: (productId: string) => boolean;
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  products: [],

  addProduct: (product: Product) => {
    set((state) => {
      if (state.products.length >= 4) {
        return state; // Limit to 4 products for comparison
      }
      if (!state.products.some(p => p.id === product.id)) {
        return { products: [...state.products, product] };
      }
      return state;
    });
  },

  removeProduct: (productId: string) => {
    set((state) => ({
      products: state.products.filter(p => p.id !== productId),
    }));
  },

  clearProducts: () => {
    set({ products: [] });
  },

  isInCompare: (productId: string) => {
    return get().products.some(p => p.id === productId);
  },
}));