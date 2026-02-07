import { BuildState } from '@/types/product';

export const calculateWattage = (build: BuildState): number => {
  let totalWattage = 0;

  // CPU TDP
  if (build.cpu?.specs.TDP) {
    const tdp = parseInt(build.cpu.specs.TDP.toString().replace(' W', ''));
    totalWattage += tdp || 65; // Default to 65W if parsing fails
  }

  // GPU TDP
  if (build.gpu?.specs.TDP) {
    const tdp = parseInt(build.gpu.specs.TDP.toString().replace(' W', ''));
    totalWattage += tdp || 200; // Default to 200W if parsing fails
  }

  // Add overhead for other components
  totalWattage += 100; // Motherboard, RAM, storage, fans

  // Add 20% headroom
  totalWattage = Math.ceil(totalWattage * 1.2);

  return totalWattage;
};