import { Product } from "@/types/product";

export const cpuCoolerData: Product[] = [
  {
    id: "cooler-1",
    name: "NZXT Kraken X73",
    type: "cooler",
    image: "https://placehold.co/300x300/805ad5/ffffff?text=NZXT+X73",
    price: 10260,
    specs: {
      Manufacturer: "NZXT",
      Type: "Liquid",
      Compatibility: "AM4/AM5/LGA1700"
    },
    has3D: true,
    store: "Newegg",
    stock: "In stock"
  },
  {
    id: "cooler-2",
    name: "Noctua NH-D15",
    type: "cooler",
    image: "https://placehold.co/300x300/805ad5/ffffff?text=Noctua+NH-D15",
    price: 8900,
    specs: {
      Manufacturer: "Noctua",
      Type: "Air",
      Compatibility: "AM4/AM5/LGA1700"
    },
    has3D: false,
    store: "Amazon",
    stock: "In stock"
  },
  {
    id: "cooler-3",
    name: "Cooler Master Hyper 212",
    type: "cooler",
    image: "https://placehold.co/300x300/805ad5/ffffff?text=CM+Hyper+212",
    price: 3200,
    specs: {
      Manufacturer: "Cooler Master",
      Type: "Air",
      Compatibility: "AM4/LGA1700"
    },
    has3D: false,
    store: "Newegg",
    stock: "Low stock"
  }
];