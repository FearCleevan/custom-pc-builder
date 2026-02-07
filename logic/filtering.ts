import { Product } from '@/types/product';

export interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  manufacturers?: string[];
  socket?: string;
  ramType?: string;
  searchQuery?: string;
}

export const filterProducts = (
  products: Product[],
  filters: FilterOptions
): Product[] => {
  return products.filter((product) => {
    // Price filter
    if (filters.minPrice !== undefined && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
      return false;
    }

    // Manufacturer filter
    if (filters.manufacturers && filters.manufacturers.length > 0) {
      const manufacturer = product.specs.Manufacturer;
      if (!manufacturer || !filters.manufacturers.includes(manufacturer)) {
        return false;
      }
    }

    // Socket filter (for CPUs and Motherboards)
    if (filters.socket) {
      if (product.type === 'cpu' || product.type === 'motherboard') {
        const productSocket = product.specs.Socket;
        if (productSocket !== filters.socket) {
          return false;
        }
      }
    }

    // RAM type filter (for RAM and Motherboards)
    if (filters.ramType) {
      if (product.type === 'ram' || product.type === 'motherboard') {
        const productRamType = product.specs['RAM Type'];
        if (productRamType !== filters.ramType) {
          return false;
        }
      }
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (!product.name.toLowerCase().includes(query)) {
        return false;
      }
    }

    return true;
  });
};