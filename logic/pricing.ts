import { BuildState } from '@/types/product';

export const calculateTotalPrice = (build: BuildState): number => {
  return Object.values(build).reduce((total, product) => {
    return total + (product?.price || 0);
  }, 0);
};

export const formatPrice = (price: number): string => {
  return `$${(price / 100).toFixed(2)}`;
};