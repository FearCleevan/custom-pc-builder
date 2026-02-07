import { Product } from "@/types/product";

export const ramData: Product[] = [
  {
    id: "ram-1",
    name: "Corsair Vengeance RGB 32GB DDR5",
    type: "ram",
    image: "https://placehold.co/300x300/d69e2e/ffffff?text=Corsair+32GB",
    price: 7410,
    specs: {
      "RAM Type": "DDR5",
      "Total Capacity": "32 GB",
      Speed: "6000 MHz",
      Manufacturer: "Corsair"
    },
    has3D: false,
    store: "Amazon",
    stock: "In stock"
  },
  {
    id: "ram-2",
    name: "G.Skill Trident Z5 RGB 64GB DDR5",
    type: "ram",
    image: "https://placehold.co/300x300/d69e2e/ffffff?text=G.Skill+64GB",
    price: 15400,
    specs: {
      "RAM Type": "DDR5",
      "Total Capacity": "64 GB",
      Speed: "6400 MHz",
      Manufacturer: "G.Skill"
    },
    has3D: false,
    store: "Newegg",
    stock: "In stock"
  },
  {
    id: "ram-3",
    name: "Kingston Fury Beast 16GB DDR4",
    type: "ram",
    image: "https://placehold.co/300x300/d69e2e/ffffff?text=Kingston+16GB",
    price: 3200,
    specs: {
      "RAM Type": "DDR4",
      "Total Capacity": "16 GB",
      Speed: "3200 MHz",
      Manufacturer: "Kingston"
    },
    has3D: false,
    store: "Amazon",
    stock: "In stock"
  }
];