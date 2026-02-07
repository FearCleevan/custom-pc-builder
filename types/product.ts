export interface Product {
  id: string;
  name: string;
  type: string;
  image: string;
  price: number;
  specs: Record<string, any>;
  has3D?: boolean;
  store?: string;
  stock?: string;
}

export type ProductType = 
  | 'cpu' 
  | 'gpu' 
  | 'motherboard' 
  | 'ram' 
  | 'cooler' 
  | 'storage' 
  | 'psu' 
  | 'case'
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'headphones'
  | 'microphone'
  | 'speakers'
  | 'webcam'
  | 'fan';

export interface BuildSlot {
  type: ProductType;
  product: Product | null;
}

export interface BuildState {
  cpu: Product | null;
  gpu: Product | null;
  motherboard: Product | null;
  ram: Product | null;
  cooler: Product | null;
  storage: Product | null;
  psu: Product | null;
  case: Product | null;
}

export interface CompatibilityIssue {
  type: 'error' | 'warning';
  message: string;
}