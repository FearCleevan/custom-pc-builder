import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Color palette
export const COLORS = {
  // Background colors
  background: '#0f1117',
  surface: '#1a1d28',
  surfaceLight: '#242834',
  surfaceElevated: '#2d3243',
  
  // Primary colors
  primary: '#4361ee',
  primaryLight: '#5d7cf4',
  primaryDark: '#3a56d4',
  
  // Secondary colors
  secondary: '#3a86ff',
  secondaryLight: '#5598ff',
  secondaryDark: '#2d6acc',
  
  // Semantic colors
  success: '#4cc9f0',
  successLight: '#6ad5f3',
  successDark: '#3aa0c7',
  
  warning: '#f8961e',
  warningLight: '#f9a94a',
  warningDark: '#c47718',
  
  danger: '#f72585',
  dangerLight: '#f94a9a',
  dangerDark: '#c61e6a',
  
  info: '#7209b7',
  infoLight: '#8a1dcc',
  infoDark: '#5a0792',
  
  // Text colors
  text: {
    primary: '#ffffff',
    secondary: '#b0b7d1',
    tertiary: '#8a93b0',
    disabled: '#6b7280',
    inverse: '#0f1117',
  },
  
  // Border colors
  border: '#2a2e3d',
  borderLight: '#3a3f52',
  borderDark: '#1f222e',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  
  // Overlay colors
  overlay: 'rgba(15, 17, 23, 0.8)',
  overlayLight: 'rgba(15, 17, 23, 0.5)',
  
  // Gradients (for common usage)
  gradients: {
    primary: ['#4361ee', '#7209b7'],
    secondary: ['#3a86ff', '#4cc9f0'],
    success: ['#4cc9f0', '#3a86ff'],
    warning: ['#f8961e', '#f9c74f'],
    danger: ['#f72585', '#ff595e'],
    dark: ['#1a1d28', '#0f1117'],
    light: ['#242834', '#1a1d28'],
  },
} as const;

// Typography
export const TYPOGRAPHY = {
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
  },
  
  fontWeights: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
} as const;

// Border Radius
export const BORDER_RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// Shadows
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  
  // Colored shadows
  primary: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  success: {
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  warning: {
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  danger: {
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// Screen dimensions
export const DIMENSIONS = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmallScreen: SCREEN_WIDTH < 375,
  isMediumScreen: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeScreen: SCREEN_WIDTH >= 414,
} as const;

// Component-specific styles
export const COMPONENTS = {
  // Button styles
  button: {
    primary: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
      textColor: COLORS.white,
    },
    secondary: {
      backgroundColor: COLORS.surface,
      borderColor: COLORS.border,
      textColor: COLORS.text.primary,
    },
    success: {
      backgroundColor: COLORS.success,
      borderColor: COLORS.success,
      textColor: COLORS.white,
    },
    warning: {
      backgroundColor: COLORS.warning,
      borderColor: COLORS.warning,
      textColor: COLORS.white,
    },
    danger: {
      backgroundColor: COLORS.danger,
      borderColor: COLORS.danger,
      textColor: COLORS.white,
    },
    outline: {
      backgroundColor: COLORS.transparent,
      borderColor: COLORS.border,
      textColor: COLORS.text.primary,
    },
    ghost: {
      backgroundColor: COLORS.transparent,
      borderColor: COLORS.transparent,
      textColor: COLORS.text.primary,
    },
  },
  
  // Card styles
  card: {
    default: {
      backgroundColor: COLORS.surface,
      borderColor: COLORS.border,
      borderRadius: BORDER_RADIUS.lg,
    },
    elevated: {
      backgroundColor: COLORS.surfaceElevated,
      borderColor: COLORS.border,
      borderRadius: BORDER_RADIUS.lg,
    },
  },
  
  // Input styles
  input: {
    default: {
      backgroundColor: COLORS.surfaceLight,
      borderColor: COLORS.border,
      textColor: COLORS.text.primary,
      placeholderColor: COLORS.text.tertiary,
    },
    focused: {
      backgroundColor: COLORS.surfaceLight,
      borderColor: COLORS.primary,
      textColor: COLORS.text.primary,
    },
    error: {
      backgroundColor: COLORS.surfaceLight,
      borderColor: COLORS.danger,
      textColor: COLORS.text.primary,
    },
  },
  
  // Badge styles
  badge: {
    primary: {
      backgroundColor: COLORS.primary + '15',
      textColor: COLORS.primary,
      borderColor: COLORS.primary + '30',
    },
    secondary: {
      backgroundColor: COLORS.secondary + '15',
      textColor: COLORS.secondary,
      borderColor: COLORS.secondary + '30',
    },
    success: {
      backgroundColor: COLORS.success + '15',
      textColor: COLORS.success,
      borderColor: COLORS.success + '30',
    },
    warning: {
      backgroundColor: COLORS.warning + '15',
      textColor: COLORS.warning,
      borderColor: COLORS.warning + '30',
    },
    danger: {
      backgroundColor: COLORS.danger + '15',
      textColor: COLORS.danger,
      borderColor: COLORS.danger + '30',
    },
    info: {
      backgroundColor: COLORS.info + '15',
      textColor: COLORS.info,
      borderColor: COLORS.info + '30',
    },
  },
} as const;

// Theme object
export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  dimensions: DIMENSIONS,
  components: COMPONENTS,
} as const;

// Type exports
export type ColorPalette = typeof COLORS;
export type Typography = typeof TYPOGRAPHY;
export type Spacing = typeof SPACING;
export type BorderRadius = typeof BORDER_RADIUS;
export type Shadows = typeof SHADOWS;
export type Theme = typeof THEME;

export default THEME;