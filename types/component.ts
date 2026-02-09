export interface ComponentItem {
  id: string;
  name: string;
  type: string;
  category?: string; // Add this - optional since it might be the same as type
  image?: string;
  price: number;
  specs: Record<string, string | number>;
  stock: string;
  stockCount?: number; // Add this - optional
  quantity?: number; // Add this - optional
  store?: string;
  has3D?: boolean;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  stock: string;
  specs: Record<string, any>;
  store?: string;
  has3D?: boolean;
}

export interface ComponentCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
}
