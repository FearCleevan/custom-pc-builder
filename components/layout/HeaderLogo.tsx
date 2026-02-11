// components/layout/HeaderLogo.tsx
import { THEME } from '@/theme/indexs';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const HeaderLogo = () => {
  const { colors: COLORS, spacing: SPACING, borderRadius: BORDER_RADIUS } = THEME;

  return (
    <View style={styles.logoContainer}>
      <View style={[styles.logoWrapper, { 
        backgroundColor: THEME.components.badge.primary.backgroundColor,
        borderColor: THEME.components.badge.primary.borderColor 
      }]}>
        <Text style={styles.logoText}>PC</Text>
      </View>
      <View style={styles.logoTextContainer}>
        <Text style={styles.logoMainText}>NEXUS</Text>
        <Text style={styles.logoSubText}>BUILD</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  logoWrapper: {
    width: 40,
    height: 40,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoText: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.black,
    color: THEME.colors.text.primary,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  logoTextContainer: {
    marginLeft: THEME.spacing.xs,
  },
  logoMainText: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.black,
    color: THEME.colors.text.primary,
    letterSpacing: THEME.typography.letterSpacing.wider,
  },
  logoSubText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.text.secondary,
    letterSpacing: THEME.typography.letterSpacing.wider,
    marginTop: -THEME.spacing.xs,
  },
});