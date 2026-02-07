import { Product } from "@/types/product";

export const cpuData: Product[] = [
  {
    id: "cpu-1",
    name: "AMD Ryzen 9 7950X",
    type: "cpu",
    image: "https://placehold.co/300x300/4a5568/ffffff?text=AMD+7950X",
    price: 34200,
    specs: {
      Socket: "AM5",
      Microarchitecture: "Zen 4",
      "Integrated Graphics": "AMD Radeon Graphics",
      TDP: "170 W",
      "Core Count": "16",
      "Thread Count": "32",
      "Base Clock": "4.5 GHz",
      "Max Boost Clock": "5.7 GHz",
      Manufacturer: "AMD"
    },
    has3D: true,
    store: "Newegg",
    stock: "In stock"
  },
  {
    id: "cpu-2",
    name: "Intel Core i9-13900K",
    type: "cpu",
    image: "https://placehold.co/300x300/3182ce/ffffff?text=Intel+i9",
    price: 37500,
    specs: {
      Socket: "LGA1700",
      Microarchitecture: "Raptor Lake",
      "Integrated Graphics": "Intel UHD Graphics 770",
      TDP: "125 W",
      "Core Count": "24",
      "Thread Count": "32",
      "Base Clock": "3.0 GHz",
      "Max Boost Clock": "5.8 GHz",
      Manufacturer: "Intel"
    },
    has3D: true,
    store: "Amazon",
    stock: "In stock"
  },
  {
    id: "cpu-3",
    name: "AMD Ryzen 5 7600X",
    type: "cpu",
    image: "https://placehold.co/300x300/4a5568/ffffff?text=AMD+7600X",
    price: 18500,
    specs: {
      Socket: "AM5",
      Microarchitecture: "Zen 4",
      "Integrated Graphics": "AMD Radeon Graphics",
      TDP: "105 W",
      "Core Count": "6",
      "Thread Count": "12",
      "Base Clock": "4.7 GHz",
      "Max Boost Clock": "5.3 GHz",
      Manufacturer: "AMD"
    },
    has3D: true,
    store: "Newegg",
    stock: "Low stock"
  }
];