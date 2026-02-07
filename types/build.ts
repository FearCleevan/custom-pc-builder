import { Product } from './product';

export interface SavedBuild {
  id: string;
  name: string;
  createdAt: Date;
  parts: Record<string, Product>;
  totalPrice: number;
  wattage: number;
}