import { Product } from '@/types/product';
import { create } from 'zustand';

interface CompareStore {
  products: Product[];
  currentType: string | null; // Track the type of products being compared
  addProduct: (product: Product) => { success: boolean; message: string };
  removeProduct: (productId: string) => void;
  clearProducts: () => void;
  isInCompare: (productId: string) => boolean;
  canAddProduct: (product: Product) => { canAdd: boolean; message: string };
}

export const useCompareStore = create<CompareStore>((set, get) => ({
  products: [],
  currentType: null,

  addProduct: (product: Product) => {
    const state = get();
    
    // Check if product already exists
    if (state.products.some(p => p.id === product.id)) {
      return { success: false, message: 'Product already in comparison.' };
    }
    
    // Check limit (max 4 products)
    if (state.products.length >= 4) {
      return { success: false, message: 'Maximum 4 products can be compared at once.' };
    }
    
    // Check if we're starting fresh or need to match type
    if (state.products.length === 0) {
      // First product - set the type
      set({ 
        products: [...state.products, product],
        currentType: product.type 
      });
      return { success: true, message: 'Product added to comparison.' };
    }
    
    // Check if product type matches existing products
    if (state.currentType !== product.type) {
      return { 
        success: false, 
        message: `You can only compare ${state.currentType?.toUpperCase()} with other ${state.currentType?.toUpperCase()} components. Please clear comparison or select a ${state.currentType}.` 
      };
    }
    
    // Add product
    set({ products: [...state.products, product] });
    return { success: true, message: 'Product added to comparison.' };
  },

  removeProduct: (productId: string) => {
    set((state) => {
      const newProducts = state.products.filter(p => p.id !== productId);
      // If no products left, reset currentType
      const newType = newProducts.length === 0 ? null : state.currentType;
      return { products: newProducts, currentType: newType };
    });
  },

  clearProducts: () => {
    set({ products: [], currentType: null });
  },

  isInCompare: (productId: string) => {
    return get().products.some(p => p.id === productId);
  },

  canAddProduct: (product: Product) => {
    const state = get();
    
    if (state.products.some(p => p.id === product.id)) {
      return { canAdd: false, message: 'Product already in comparison.' };
    }
    
    if (state.products.length >= 4) {
      return { canAdd: false, message: 'Maximum 4 products can be compared at once.' };
    }
    
    if (state.products.length > 0 && state.currentType !== product.type) {
      return { 
        canAdd: false, 
        message: `You can only compare ${state.currentType?.toUpperCase()} with other ${state.currentType?.toUpperCase()} components.` 
      };
    }
    
    return { canAdd: true, message: '' };
  },
}));