import { Product } from "@/types/product";

export const gpuData: Product[] = [
  {
    id: "gpu-1",
    name: "NVIDIA GeForce RTX 4090 24GB",
    type: "gpu",
    image: "https://placehold.co/300x300/38a169/ffffff?text=RTX+4090",
    price: 91200,
    specs: {
      Chipset: "RTX 4090",
      "Memory Size": "24 GB",
      TDP: "450 W",
      Manufacturer: "NVIDIA"
    },
    has3D: true,
    store: "Newegg",
    stock: "In stock"
  },
  {
    id: "gpu-2",
    name: "AMD Radeon RX 7900 XTX",
    type: "gpu",
    image: "https://placehold.co/300x300/38a169/ffffff?text=RX+7900",
    price: 64900,
    specs: {
      Chipset: "RX 7900 XTX",
      "Memory Size": "24 GB",
      TDP: "355 W",
      Manufacturer: "AMD"
    },
    has3D: true,
    store: "Amazon",
    stock: "In stock"
  },
  {
    id: "gpu-3",
    name: "NVIDIA GeForce RTX 4070 Ti",
    type: "gpu",
    image: "https://placehold.co/300x300/38a169/ffffff?text=RTX+4070",
    price: 41900,
    specs: {
      Chipset: "RTX 4070 Ti",
      "Memory Size": "12 GB",
      TDP: "285 W",
      Manufacturer: "NVIDIA"
    },
    has3D: true,
    store: "Newegg",
    stock: "Low stock"
  }
];