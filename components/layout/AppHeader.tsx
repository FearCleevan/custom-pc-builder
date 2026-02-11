// components/layout/AppHeader.tsx
import { useCompareStore } from '@/store/useCompareStore';
import { THEME } from '@/theme/indexs';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';
import { HeaderIcons } from './HeaderIcons';
import { HeaderLogo } from './HeaderLogo';

export const AppHeader = () => {
  const compareProducts = useCompareStore((state) => state.products);

  return (
    <LinearGradient
      colors={THEME.colors.gradients.dark}
      style={styles.headerGradient}
    >
      <HeaderLogo />
      <HeaderIcons compareCount={compareProducts.length} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.xl + 10,
    paddingBottom: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
});