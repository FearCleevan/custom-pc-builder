export interface ComponentItem {
  id: string;
  name: string;
  type: string;
  price: number;
  stock: string;
  specs: Record<string, any>;
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