import { BuildState, Product, ProductType } from '@/types/product';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface BuildStore extends BuildState {
  addPart: (type: ProductType, product: Product) => void;
  removePart: (type: ProductType) => void;
  clearBuild: () => void;
  getTotalPrice: () => number;
  getBuildState: () => BuildState;
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

export const useBuildStore = create<BuildStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addPart: (type: ProductType, product: Product) => {
        set((state) => ({ ...state, [type]: product }));
      },

      removePart: (type: ProductType) => {
        set((state) => ({ ...state, [type]: null }));
      },

      clearBuild: () => {
        set(initialState);
      },

      getTotalPrice: () => {
        const state = get();
        return Object.values(state).reduce((total, product) => {
          return total + (product?.price || 0);
        }, 0);
      },

      getBuildState: () => {
        const { cpu, gpu, motherboard, ram, cooler, storage, psu, case: casePart } = get();
        return { cpu, gpu, motherboard, ram, cooler, storage, psu, case: casePart };
      },
    }),
    {
      name: 'build-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Create a selector hook for build state
export const useBuildState = () => {
  return useBuildStore((state) => ({
    cpu: state.cpu,
    gpu: state.gpu,
    motherboard: state.motherboard,
    ram: state.ram,
    cooler: state.cooler,
    storage: state.storage,
    psu: state.psu,
    case: state.case,
  }));
};