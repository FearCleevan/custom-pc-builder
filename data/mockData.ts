// app/data/mockData.ts
export interface ComponentSpecs {
  [key: string]: string | number | boolean;
}

export interface ComponentItem {
  id: string;
  name: string;
  type: string;
  image: string;
  price: number;
  specs: ComponentSpecs;
  stock: string;
  stockCount: number;
  category?: string; // For filtering
}

// CPU Data
export const cpuData: ComponentItem[] = [
  {
    id: 'cpu-1',
    name: 'AMD Ryzen 9 7950X',
    type: "cpu",
    category: "cpu",
    image: '/assets/cpu-1.png',
    price: 34200.00,
    specs: {
      "Socket": "AM5",
      "Microarchitecture": "Zen 4",
      "Integrated Graphics": "AMD Radeon Graphics",
      "TDP": "170 W",
      "Core Count": "16",
      "Thread Count": "32",
      "Base Clock": "4.5 GHz",
      "Max Boost Clock": "5.7 GHz",
      "L2 Cache": "16 MB",
      "L3 Cache": "64 MB",
      "Manufacturer": "AMD"
    },
    stock: "In stock",
    stockCount: 20,
  },
  {
    id: 'cpu-2',
    name: 'Intel Core i9-14900K',
    type: "cpu",
    category: "cpu",
    image: '/assets/cpu-2.png',
    price: 36500.00,
    specs: {
      "Socket": "LGA1700",
      "Microarchitecture": "Raptor Lake",
      "Integrated Graphics": "Intel UHD Graphics 770",
      "TDP": "125 W",
      "Core Count": "24",
      "Thread Count": "32",
      "Base Clock": "3.2 GHz",
      "Max Boost Clock": "6.0 GHz",
      "L2 Cache": "32 MB",
      "L3 Cache": "36 MB",
      "Manufacturer": "Intel"
    },
    stock: "In stock",
    stockCount: 15,
  },
  // Add more CPUs...
];

// GPU Data
export const gpuData: ComponentItem[] = [
  {
    id: 'gpu-1',
    name: 'NVIDIA GeForce RTX 4090 24GB',
    type: "gpu",
    category: "gpu",
    image: '/assets/gpu-1.png',
    price: 91200.00,
    specs: {
      "Chipset": "GeForce RTX 4090",
      "Memory Type": "GDDR6X",
      "Memory Size": "24 GB",
      "Interface": "PCIe 4.0 x16",
      "Manufacturer": "NVIDIA",
      "Color": "BLACK",
      "TDP": "450 W",
      "Card Length": "304 mm",
      "Boost Clock": "2520 MHz",
      "Base Clock": "2235 MHz",
      "Memory Interface": "384-bit",
      "DisplayPort Outputs": 3,
      "HDMI Outputs": 1,
      "Power Connectors": "16-pin"
    },
    stock: "In stock",
    stockCount: 20,
  },
  {
    id: 'gpu-2',
    name: 'AMD Radeon RX 7900 XTX 24GB',
    type: "gpu",
    category: "gpu",
    image: '/assets/gpu-2.png',
    price: 65400.00,
    specs: {
      "Chipset": "Radeon RX 7900 XTX",
      "Memory Type": "GDDR6",
      "Memory Size": "24 GB",
      "Interface": "PCIe 4.0 x16",
      "Manufacturer": "AMD",
      "Color": "BLACK",
      "TDP": "355 W",
      "Card Length": "287 mm",
      "Boost Clock": "2500 MHz",
      "Base Clock": "1900 MHz",
      "Memory Interface": "384-bit",
      "DisplayPort Outputs": 2,
      "HDMI Outputs": 2,
      "Power Connectors": "2x 8-pin"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more GPUs...
];

// Motherboard Data
export const motherboardData: ComponentItem[] = [
  {
    id: "mb-1",
    name: "ASUS ROG Strix X670E-E Gaming WiFi",
    type: "motherboard",
    category: "motherboard",
    image: '/assets/mb-1.png',
    price: 25650.00,
    specs: {
      "Socket": "AM5",
      "Chipset": "AMD X670E",
      "Form Factor": "ATX",
      "RAM Type": "DDR5",
      "Manufacturer": "ASUS",
      "Color": "BLACK",
      "Maximum Memory": "128 GB",
      "Memory Slots": 4,
      "Memory Speed": "6400MHz+",
      "PCIe 5.0 Slots": 1,
      "M.2 Slots": 4,
      "SATA Ports": 6,
      "WiFi": "WiFi 6E",
      "Bluetooth": "Bluetooth 5.3",
      "RGB Lighting": "Aura Sync RGB",
      "Audio": "ROG SupremeFX 7.1",
      "LAN": "2.5Gb Ethernet"
    },
    stock: "In stock",
    stockCount: 20,
  },
  {
    id: "mb-2",
    name: "MSI MPG Z790 Carbon WiFi",
    type: "motherboard",
    category: "motherboard",
    image: '/assets/mb-2.png',
    price: 22800.00,
    specs: {
      "Socket": "LGA1700",
      "Chipset": "Intel Z790",
      "Form Factor": "ATX",
      "RAM Type": "DDR5",
      "Manufacturer": "MSI",
      "Color": "BLACK",
      "Maximum Memory": "192 GB",
      "Memory Slots": 4,
      "Memory Speed": "7200MHz+",
      "PCIe 5.0 Slots": 1,
      "M.2 Slots": 5,
      "SATA Ports": 6,
      "WiFi": "WiFi 6E",
      "Bluetooth": "Bluetooth 5.3",
      "RGB Lighting": "Mystic Light",
      "Audio": "ALC4080 7.1",
      "LAN": "2.5Gb Ethernet"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more motherboards...
];

// RAM Data
export const ramData: ComponentItem[] = [
  {
    id: 'ram-1',
    name: 'Corsair Vengeance RGB 32GB DDR5 6000MHz',
    type: "ram",
    category: "ram",
    image: '/assets/ram-1.png',
    price: 7410.00,
    specs: {
      "RAM Type": "DDR5",
      "Form Factor": "288-pin DIMM",
      "Capacity Per Module": "16GB",
      "Total Capacity": "32 GB",
      "Number of Modules": 2,
      "Speed": "6000 MHz",
      "CAS Latency": 36,
      "Timing": "CL36",
      "Voltage": "1.35V",
      "RGB": "Yes",
      "Heat Spreader": "Aluminum",
      "XMP/EXPO": "XMP 3.0 / EXPO",
      "Manufacturer": "Corsair",
      "Color": "BLACK"
    },
    stock: "In stock",
    stockCount: 20,
  },
  {
    id: 'ram-2',
    name: 'G.Skill Trident Z5 RGB 64GB DDR5 6400MHz',
    type: "ram",
    category: "ram",
    image: '/assets/ram-2.png',
    price: 14200.00,
    specs: {
      "RAM Type": "DDR5",
      "Form Factor": "288-pin DIMM",
      "Capacity Per Module": "32GB",
      "Total Capacity": "64 GB",
      "Number of Modules": 2,
      "Speed": "6400 MHz",
      "CAS Latency": 32,
      "Timing": "CL32",
      "Voltage": "1.4V",
      "RGB": "Yes",
      "Heat Spreader": "Aluminum",
      "XMP/EXPO": "XMP 3.0",
      "Manufacturer": "G.Skill",
      "Color": "BLACK/SILVER"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more RAM...
];

// Storage Data
export const storageData: ComponentItem[] = [
  {
    id: 'storage-1',
    name: 'Samsung 980 Pro 2TB PCIe 4.0 NVMe SSD',
    type: "storage",
    category: "storage",
    image: '/assets/storage-1.png',
    price: 9143.43,
    specs: {
      "Type": "SSD",
      "Form Factor": "M.2 2280",
      "Capacity": "2000 GB",
      "Interface": "PCIe 4.0 x4",
      "NVMe": "Yes",
      "Sequential Read": "7000 MB/s",
      "Sequential Write": "5000 MB/s",
      "Random Read": "1000K IOPS",
      "Random Write": "1000K IOPS",
      "TBW": "1200 TB",
      "DRAM Cache": "Yes",
      "NAND Type": "TLC",
      "Encryption": "AES 256-bit",
      "Warranty": "5 years",
      "Manufacturer": "Samsung"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more storage...
];

// Power Supply Data
export const powerSupplyData: ComponentItem[] = [
  {
    id: 'psu-1',
    name: 'Corsair RM1000x 1000W 80+ Gold Modular',
    type: "psu",
    category: "psu",
    image: '/assets/psu-1.png',
    price: 10830.00,
    specs: {
      "Form Factor": "ATX",
      "Wattage": "1000 W",
      "Efficiency Rating": "80+ Gold",
      "Modularity": "Full Modular",
      "Fan Size": "135 mm",
      "Fan Type": "Fluid Dynamic Bearing",
      "Zero RPM Mode": "Yes",
      "PCIe 5.0 Support": "Yes",
      "PCIe 12VHPWR": "1x",
      "PCIe 6+2-pin": "8x",
      "EPS 8-pin (CPU)": "2x",
      "SATA": "12x",
      "Molex 4-pin": "4x",
      "Protections": "OPP, OVP, UVP, OCP, OTP, SCP",
      "Warranty": "10 years",
      "Manufacturer": "Corsair",
      "Color": "BLACK"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more PSUs...
];

// Case Data
export const caseData: ComponentItem[] = [
  {
    id: 'case-1',
    name: 'Antec C8 ATX Full Tower',
    type: "case",
    category: "case",
    image: '/assets/case-1.png',
    price: 11413.93,
    specs: {
      "Form Factor": "ATX Full Tower",
      "Side Panel": "Tempered Glass",
      "Color": "BLACK",
      "Max GPU Length": "450 mm",
      "Max CPU Cooler Height": "185 mm",
      "Motherboard Support": "E-ATX, ATX, Micro-ATX, Mini-ITX",
      "3.5\" Drive Bays": 6,
      "2.5\" Drive Bays": 4,
      "Expansion Slots": 8,
      "Pre-installed Fans": "3x 120mm",
      "Fan Support": "Front: 3x 120/140mm, Top: 3x 120/140mm, Rear: 1x 120mm",
      "Radiator Support": "Front: 360mm, Top: 360mm, Rear: 120mm",
      "Dust Filters": "Yes",
      "USB Ports": "2x USB 3.0, 1x USB-C",
      "Volume": "68 L",
      "Weight": "12.9 kg",
      "Manufacturer": "Antec"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more cases...
];

// CPU Cooler Data
export const cpuCoolerData: ComponentItem[] = [
  {
    id: 'cooler-1',
    name: 'NZXT Kraken X73 RGB 360mm AIO Liquid Cooler',
    type: "cooler",
    category: "cooler",
    image: '/assets/cooler-1.png',
    price: 10260.00,
    specs: {
      "Type": "Liquid Cooler",
      "Radiator Size": "360 mm",
      "Fan Size": "120 mm",
      "Fan Quantity": 3,
      "Fan Speed": "500-2000 RPM",
      "Noise Level": "21-36 dB",
      "Pump Speed": "800-2800 RPM",
      "Socket Support": "Intel LGA 1150/1151/1155/1156/1200/1366/1700/2011/2011-3/2066, AMD AM4/AM5",
      "RGB Lighting": "Yes",
      "Software Control": "NZXT CAM",
      "Tube Length": "400 mm",
      "Warranty": "6 years",
      "Manufacturer": "NZXT",
      "Color": "BLACK"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more coolers...
];

// Case Fan Data
export const caseFanData: ComponentItem[] = [
  {
    id: 'fan-1',
    name: 'Noctua NF-A12x25 PWM Premium Quiet Fan',
    type: "fan",
    category: "fan",
    image: '/assets/fan-1.png',
    price: 1710.43,
    specs: {
      "Size": "120mm",
      "Airflow": "60.1 CFM",
      "Noise Level": "22.6 dB",
      "Static Pressure": "2.34 mmH₂O",
      "Speed": "2000 RPM",
      "Bearing Type": "SSO2",
      "Connector": "4-pin PWM",
      "Current": "0.14 A",
      "Voltage": "12 V",
      "Power": "1.68 W",
      "MTBF": "150,000 hours",
      "Warranty": "6 years",
      "LED": "None",
      "Color": "BROWN",
      "Manufacturer": "Noctua"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more fans...
];

// Monitor Data
export const monitorData: ComponentItem[] = [
  {
    id: 'monitor-1',
    name: 'Samsung Odyssey G7 32" QHD 240Hz Curved Gaming Monitor',
    type: "monitor",
    category: "monitor",
    image: '/assets/monitor-1.png',
    price: 34200.00,
    specs: {
      "Screen Size": "32",
      "Resolution": "2560 x 1440 (QHD)",
      "Refresh Rate": "240Hz",
      "Response Time": "1ms",
      "Panel Type": "VA",
      "Curvature": "1000R",
      "Brightness": "600 nits",
      "Contrast Ratio": "2500:1",
      "HDR": "HDR600",
      "Adaptive Sync": "G-Sync Compatible, FreeSync Premium Pro",
      "Ports": "DisplayPort 1.4, HDMI 2.1, USB Hub",
      "Stand Adjustments": "Height, Tilt, Swivel",
      "VESA Mount": "100x100mm",
      "Color Gamut": "125% sRGB",
      "Warranty": "3 years",
      "Manufacturer": "Samsung"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more monitors...
];

// Keyboard Data
export const keyboardData: ComponentItem[] = [
  {
    id: 'keyboard-1',
    name: 'Corsair K100 RGB Mechanical Gaming Keyboard',
    type: "keyboard",
    category: "keyboard",
    image: '/assets/keyboard-1.png',
    price: 11400.00,
    specs: {
      "Switch Type": "Cherry MX Speed Silver",
      "Backlight": "RGB",
      "Connectivity": "Wired",
      "Layout": "Full-size (100%)",
      "Keycaps": "Double-shot PBT",
      "Actuation Force": "45g",
      "Actuation Point": "1.2mm",
      "Polling Rate": "4000Hz",
      "Anti-Ghosting": "Full N-key rollover",
      "Media Controls": "Yes",
      "Wrist Rest": "Detachable",
      "Construction": "Aluminum frame",
      "Software": "iCUE",
      "USB Passthrough": "Yes",
      "Manufacturer": "Corsair",
      "Color": "BLACK"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more keyboards...
];

// Mouse Data
export const mouseData: ComponentItem[] = [
  {
    id: 'mouse-1',
    name: 'Logitech G Pro X Superlight Wireless Gaming Mouse',
    type: "mouse",
    category: "mouse",
    image: '/assets/mouse-1.png',
    price: 8550.00,
    specs: {
      "Sensor": "HERO 25K",
      "Weight": "63g",
      "Connectivity": "Wireless",
      "DPI": "25600",
      "Polling Rate": "1000Hz",
      "Buttons": "5",
      "Switch Type": "Optical",
      "Battery Life": "70 hours",
      "Charging": "USB-C",
      "RGB Lighting": "No",
      "Hand Orientation": "Right-handed",
      "Grip Style": "Ambidextrous",
      "Dimensions": "125 x 63.5 x 40 mm",
      "Software": "Logitech G Hub",
      "Manufacturer": "Logitech",
      "Color": "BLACK/WHITE"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more mice...
];

// Headphones Data
export const headphoneData: ComponentItem[] = [
  {
    id: 'headphones-1',
    name: 'SteelSeries Arctis Pro Wireless Gaming Headset',
    type: "headphones",
    category: "headphones",
    image: '/assets/headphones-1.png',
    price: 18810.00,
    specs: {
      "Type": "Over-ear",
      "Connectivity": "Wireless",
      "Driver Size": "40mm",
      "Frequency Response": "10-40,000 Hz",
      "Impedance": "32 ohms",
      "Sensitivity": "102 dB",
      "Battery Life": "20 hours",
      "Microphone": "Retractable ClearCast",
      "Microphone Frequency Response": "100-10,000 Hz",
      "Noise Cancellation": "None",
      "Weight": "374g",
      "Charging": "Dual-battery system",
      "Compatibility": "PC, PS4, PS5, Mobile",
      "Manufacturer": "SteelSeries",
      "Color": "BLACK"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more headphones...
];

// Microphone Data
export const microphoneData: ComponentItem[] = [
  {
    id: 'microphone-1',
    name: 'Blue Yeti USB Microphone',
    type: "microphone",
    category: "microphone",
    image: '/assets/microphone-1.png',
    price: 7410.00,
    specs: {
      "Type": "Condenser",
      "Patterns": "Cardioid, Bidirectional, Omnidirectional, Stereo",
      "Connectivity": "USB",
      "Sample Rate": "48 kHz",
      "Bit Depth": "16-bit",
      "Frequency Response": "20Hz - 20kHz",
      "Sensitivity": "4.5mV/Pa",
      "Max SPL": "120 dB",
      "Headphone Output": "Yes",
      "Gain Control": "Yes",
      "Mute Button": "Yes",
      "Mount Included": "Yes",
      "Weight": "0.54 kg",
      "Manufacturer": "Blue",
      "Color": "BLACK/SILVER"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more microphones...
];

// Speaker Data
export const speakerData: ComponentItem[] = [
  {
    id: 'speaker-1',
    name: 'Logitech G560 LIGHTSYNC PC Gaming Speakers',
    type: "speakers",
    category: "speakers",
    image: '/assets/speaker-1.png',
    price: 11499.95,
    specs: {
      "Configuration": "2.1",
      "Total RMS Power": "240W",
      "Satellite Power": "35W each",
      "Subwoofer Power": "170W",
      "Connectivity": "USB, Bluetooth, 3.5mm",
      "Frequency Response": "40Hz - 20kHz",
      "Drivers": "2.5\" woofers, 1\" tweeters",
      "RGB Lighting": "LIGHTSYNC RGB",
      "Inputs": "USB, 3.5mm, Bluetooth",
      "Controls": "Volume control, power button",
      "Dimensions (Satellites)": "7.5 x 4.8 x 4.7 inches",
      "Dimensions (Subwoofer)": "11.5 x 11.1 x 10.2 inches",
      "Weight": "5.5 kg",
      "Manufacturer": "Logitech",
      "Color": "BLACK"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more speakers...
];

// Webcam Data
export const webcamData: ComponentItem[] = [
  {
    id: 'webcam-1',
    name: 'Logitech Brio 4K Ultra HD Webcam',
    type: "webcam",
    category: "webcam",
    image: '/assets/webcam-1.png',
    price: 11433.43,
    specs: {
      "Resolution": "4K Ultra HD (3840x2160)",
      "Field of View": "90° to 65° (adjustable)",
      "Frame Rate": "30fps at 4K, 60fps at 1080p",
      "Autofocus": "Yes",
      "Auto Light Correction": "RightLight 3 with HDR",
      "Microphone": "Dual omnidirectional mics with noise reduction",
      "Mounting": "Universal clip, tripod ready",
      "Connectivity": "USB-C to USB-A",
      "Compatibility": "Windows, macOS, Chrome OS",
      "Dimensions": "4.06 x 6.86 x 4.06 cm",
      "Weight": "0.15 kg",
      "Manufacturer": "Logitech",
      "Color": "BLACK"
    },
    stock: "In stock",
    stockCount: 20,
  },
  // Add more webcams...
];

// Combine all components
export const allComponents: ComponentItem[] = [
  ...cpuData,
  ...gpuData,
  ...motherboardData,
  ...ramData,
  ...storageData,
  ...powerSupplyData,
  ...caseData,
  ...cpuCoolerData,
  ...caseFanData,
  ...monitorData,
  ...keyboardData,
  ...mouseData,
  ...headphoneData,
  ...microphoneData,
  ...speakerData,
  ...webcamData,
];

// Component categories for filtering
export const componentCategories = [
  { id: 'cpu', name: 'CPU', icon: 'hardware-chip-outline' },
  { id: 'gpu', name: 'GPU', icon: 'game-controller-outline' },
  { id: 'motherboard', name: 'Motherboard', icon: 'grid-outline' },
  { id: 'ram', name: 'RAM', icon: 'albums-outline' },
  { id: 'storage', name: 'Storage', icon: 'save-outline' },
  { id: 'psu', name: 'Power Supply', icon: 'flash-outline' },
  { id: 'case', name: 'Case', icon: 'cube-outline' },
  { id: 'cooler', name: 'CPU Cooler', icon: 'snow-outline' },
  { id: 'fan', name: 'Case Fans', icon: 'refresh-outline' },
  { id: 'monitor', name: 'Monitor', icon: 'desktop-outline' },
  { id: 'keyboard', name: 'Keyboard', icon: 'keypad-outline' },
  { id: 'mouse', name: 'Mouse', icon: 'hand-left-outline' },
  { id: 'headphones', name: 'Headphones', icon: 'headset-outline' },
  { id: 'microphone', name: 'Microphone', icon: 'mic-outline' },
  { id: 'speakers', name: 'Speakers', icon: 'volume-high-outline' },
  { id: 'webcam', name: 'Webcam', icon: 'videocam-outline' },
];

// Get components by type
export const getComponentsByType = (type: string): ComponentItem[] => {
  switch (type) {
    case 'cpu': return cpuData;
    case 'gpu': return gpuData;
    case 'motherboard': return motherboardData;
    case 'ram': return ramData;
    case 'storage': return storageData;
    case 'psu': return powerSupplyData;
    case 'case': return caseData;
    case 'cooler': return cpuCoolerData;
    case 'fan': return caseFanData;
    case 'monitor': return monitorData;
    case 'keyboard': return keyboardData;
    case 'mouse': return mouseData;
    case 'headphones': return headphoneData;
    case 'microphone': return microphoneData;
    case 'speakers': return speakerData;
    case 'webcam': return webcamData;
    default: return allComponents;
  }
};

// Pre-built series configurations
export const prebuiltSeries = {
  vision: {
    id: 'vision',
    name: 'VISION SERIES',
    description: '4K Gaming & Streaming',
    fps: '240+ FPS',
    price: 3499,
    color: '#FF00FF',
    gradient: ['#FF00FF', '#9400D3'] as const,
    specs: 'RTX 4090 | i9-14900K | 64GB DDR5',
    components: {
      cpu: cpuData.find(c => c.name.includes('14900K'))?.id || 'cpu-2',
      gpu: gpuData.find(g => g.name.includes('RTX 4090'))?.id || 'gpu-1',
      motherboard: motherboardData.find(m => m.specs.Chipset === 'Z790')?.id || 'mb-2',
      ram: ramData.find(r => r.specs["Total Capacity"] === "64 GB")?.id || 'ram-2',
      storage: storageData.find(s => s.specs.Capacity === "2000 GB")?.id || 'storage-1',
      psu: powerSupplyData.find(p => p.specs.Wattage === "1000")?.id || 'psu-1',
      case: caseData[0]?.id || 'case-1',
      cooler: cpuCoolerData.find(c => c.specs["Radiator Size"] === "360 mm")?.id || 'cooler-1',
    }
  },
  infinite: {
    id: 'infinite',
    name: 'INFINITE SERIES',
    description: 'Ultra Performance',
    fps: '360+ FPS',
    price: 4999,
    color: '#00FFFF',
    gradient: ['#00FFFF', '#008B8B'] as const,
    specs: 'RTX 4090 Ti | Ryzen 9 7950X3D | 128GB DDR5',
    components: {
      cpu: cpuData.find(c => c.name.includes('7950X'))?.id || 'cpu-1',
      gpu: gpuData.find(g => g.name.includes('RTX 4090'))?.id || 'gpu-1',
      motherboard: motherboardData.find(m => m.specs.Chipset === 'X670E')?.id || 'mb-1',
      ram: ramData.find(r => r.specs["Total Capacity"] === "128 GB")?.id,
      storage: [storageData.find(s => s.specs.Capacity === "2000 GB")?.id || 'storage-1'],
      psu: powerSupplyData.find(p => p.specs.Wattage === "1200")?.id,
      case: caseData[0]?.id || 'case-1',
      cooler: cpuCoolerData.find(c => c.specs["Radiator Size"] === "360 mm")?.id || 'cooler-1',
    }
  },
  aegis: {
    id: 'aegis',
    name: 'AEGIS SERIES',
    description: 'Competitive Esports',
    fps: '500+ FPS',
    price: 2799,
    color: '#00FF00',
    gradient: ['#00FF00', '#006400'] as const,
    specs: 'RTX 4080 Super | i7-14700K | 32GB DDR5',
    components: {
      cpu: cpuData.find(c => c.name.includes('14700K'))?.id,
      gpu: gpuData.find(g => g.name.includes('RTX 4080'))?.id,
      motherboard: motherboardData.find(m => m.specs.Chipset === 'Z790')?.id || 'mb-2',
      ram: ramData.find(r => r.specs["Total Capacity"] === "32 GB")?.id || 'ram-1',
      storage: storageData.find(s => s.specs.Capacity === "1000 GB")?.id,
      psu: powerSupplyData.find(p => p.specs.Wattage === "850")?.id,
      case: caseData.find(c => c.specs["Form Factor"] === "ATX Mid Tower")?.id,
      cooler: cpuCoolerData.find(c => c.specs["Radiator Size"] === "240 mm")?.id,
    }
  },
  codex: {
    id: 'codex',
    name: 'CODEX SERIES',
    description: 'AI & Content Creation',
    fps: '165+ FPS',
    price: 3999,
    color: '#FFFF00',
    gradient: ['#FFFF00', '#FF8C00'] as const,
    specs: 'RTX 4090 | Threadripper | 128GB DDR5',
    components: {
      cpu: cpuData.find(c => c.name.includes('Threadripper'))?.id,
      gpu: gpuData.find(g => g.name.includes('RTX 4090'))?.id || 'gpu-1',
      motherboard: motherboardData.find(m => m.specs.Socket === "TRX50")?.id,
      ram: ramData.find(r => r.specs["Total Capacity"] === "128 GB")?.id,
      storage: [storageData.find(s => s.specs.Capacity === "4000 GB")?.id],
      psu: powerSupplyData.find(p => p.specs.Wattage === "1600")?.id,
      case: caseData.find(c => c.specs["Form Factor"] === "E-ATX Full Tower")?.id,
      cooler: cpuCoolerData.find(c => c.specs["Radiator Size"] === "360 mm")?.id || 'cooler-1',
    }
  },
  industrial: {
    id: 'industrial',
    name: 'INDUSTRIAL WORKSTATION',
    description: 'Render & Simulation',
    price: 8999,
    color: '#00FFFF',
    gradient: ['#00FFFF', '#008B8B'] as const,
    specs: 'Dual RTX 6000 Ada | Threadripper Pro | 256GB ECC RAM',
    components: {
      cpu: cpuData.find(c => c.name.includes('Threadripper Pro'))?.id,
      gpu: [gpuData.find(g => g.name.includes('RTX 6000'))?.id],
      motherboard: motherboardData.find(m => m.specs.Socket === "WRX90")?.id,
      ram: ramData.find(r => r.specs["Total Capacity"] === "256 GB")?.id,
      storage: [storageData.find(s => s.specs.Capacity === "8000 GB")?.id],
      psu: powerSupplyData.find(p => p.specs.Wattage === "2000")?.id,
      case: caseData.find(c => c.specs["Form Factor"] === "Server Chassis")?.id,
      cooler: cpuCoolerData.find(c => c.specs["Radiator Size"] === "480 mm")?.id,
    }
  }
};

// Get pre-built series by ID
export const getPrebuiltSeries = (seriesId: string) => {
  return prebuiltSeries[seriesId as keyof typeof prebuiltSeries];
};