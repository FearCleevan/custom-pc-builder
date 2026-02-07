import { BuildState, Product, ProductType } from '@/types/product';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface BuildContextType extends BuildState {
  addPart: (type: ProductType, product: Product) => void;
  removePart: (type: ProductType) => void;
  clearBuild: () => void;
  getTotalPrice: () => number;
}

const initialState: BuildState = {
  cpu: null,
  gpu: null,
  motherboard: null,
  ram: null,
  cooler: null,
  storage: null,
  psu: null,
  case: null,
};

const BuildContext = createContext<BuildContextType | undefined>(undefined);

export function BuildProvider({ children }: { children: ReactNode }) {
  const [build, setBuild] = useState<BuildState>(initialState);

  const addPart = (type: ProductType, product: Product) => {
    setBuild(prev => ({ ...prev, [type]: product }));
  };

  const removePart = (type: ProductType) => {
    setBuild(prev => ({ ...prev, [type]: null }));
  };

  const clearBuild = () => {
    setBuild(initialState);
  };

  const getTotalPrice = () => {
    return Object.values(build).reduce((total, product) => {
      return total + (product?.price || 0);
    }, 0);
  };

  const value: BuildContextType = {
    ...build,
    addPart,
    removePart,
    clearBuild,
    getTotalPrice,
  };

  return (
    <BuildContext.Provider value={value}>
      {children}
    </BuildContext.Provider>
  );
}

export function useBuild() {
  const context = useContext(BuildContext);
  if (context === undefined) {
    throw new Error('useBuild must be used within a BuildProvider');
  }
  return context;
}