import { BuildState, CompatibilityIssue } from '@/types/product';

export const checkCompatibility = (build: BuildState): CompatibilityIssue[] => {
  const issues: CompatibilityIssue[] = [];

  // Check CPU and Motherboard socket compatibility
  if (build.cpu && build.motherboard) {
    const cpuSocket = build.cpu.specs.Socket;
    const mbSocket = build.motherboard.specs.Socket;
    
    if (cpuSocket !== mbSocket) {
      issues.push({
        type: 'error',
        message: `CPU socket (${cpuSocket}) doesn't match motherboard socket (${mbSocket})`,
      });
    }
  }

  // Check RAM and Motherboard compatibility
  if (build.ram && build.motherboard) {
    const ramType = build.ram.specs['RAM Type'];
    const mbRamType = build.motherboard.specs['RAM Type'];
    
    if (ramType !== mbRamType) {
      issues.push({
        type: 'error',
        message: `RAM type (${ramType}) doesn't match motherboard supported type (${mbRamType})`,
      });
    }
  }

  // Check if cooler supports CPU socket
  if (build.cooler && build.cpu) {
    const coolerCompatibility = build.cooler.specs.Compatibility;
    const cpuSocket = build.cpu.specs.Socket;
    
    if (coolerCompatibility && !coolerCompatibility.includes(cpuSocket)) {
      issues.push({
        type: 'warning',
        message: `Cooler may not support CPU socket (${cpuSocket})`,
      });
    }
  }

  // Check if CPU has integrated graphics when no GPU is selected
  if (!build.gpu && build.cpu) {
    const hasIGPU = build.cpu.specs['Integrated Graphics'] !== 'None';
    if (!hasIGPU) {
      issues.push({
        type: 'warning',
        message: 'No GPU selected and CPU has no integrated graphics',
      });
    }
  }

  return issues;
};