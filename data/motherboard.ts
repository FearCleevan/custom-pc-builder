import { Product } from "@/types/product";

export const motherboardData: Product[] = [
  {
    id: "mb-1",
    name: "ASRock B450 Pro4 R2.0 ATX AM4",
    type: "motherboard",
    image: "https://placehold.co/300x300/718096/ffffff?text=ASRock+B450",
    price: 5700,
    specs: {
      Socket: "AM4",
      Chipset: "AMD B450",
      "Form Factor": "ATX",
      "RAM Type": "DDR4",
      Manufacturer: "ASRock",
      "Maximum Memory": "64 GB",
      "Memory Slots": 4
    },
    has3D: false,
    store: "Newegg",
    stock: "In stock"
  },
  {
    id: "mb-2",
    name: "MSI MPG Z790 Edge WiFi",
    type: "motherboard",
    image: "https://placehold.co/300x300/718096/ffffff?text=MSI+Z790",
    price: 28900,
    specs: {
      Socket: "LGA1700",
      Chipset: "Intel Z790",
      "Form Factor": "ATX",
      "RAM Type": "DDR5",
      Manufacturer: "MSI",
      "Maximum Memory": "128 GB",
      "Memory Slots": 4
    },
    has3D: true,
    store: "Amazon",
    stock: "In stock"
  },
  {
    id: "mb-3",
    name: "Gigabyte B650 AORUS Elite AX",
    type: "motherboard",
    image: "https://placehold.co/300x300/718096/ffffff?text=Gigabyte+B650",
    price: 21900,
    specs: {
      Socket: "AM5",
      Chipset: "AMD B650",
      "Form Factor": "ATX",
      "RAM Type": "DDR5",
      Manufacturer: "Gigabyte",
      "Maximum Memory": "128 GB",
      "Memory Slots": 4
    },
    has3D: true,
    store: "Newegg",
    stock: "In stock"
  }
];