export const colors = {
  // Primary
  primary: '#3182ce',
  primaryDark: '#2c5282',
  
  // Status
  success: '#38a169',
  warning: '#d69e2e',
  error: '#e53e3e',
  info: '#3182ce',
  
  // Backgrounds
  background: '#ffffff',
  cardBackground: '#f7fafc',
  modalBackground: 'rgba(0, 0, 0, 0.5)',
  
  // Text
  textPrimary: '#2d3748',
  textSecondary: '#718096',
  textLight: '#ffffff',
  
  // Borders
  border: '#e2e8f0',
  borderDark: '#cbd5e0',
  
  // Gradients
  gradientStart: '#4299e1',
  gradientEnd: '#3182ce',
} as const;

export type ColorTheme = typeof colors;