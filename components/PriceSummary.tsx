import { calculateTotalPrice } from '@/logic/pricing';
import { calculateWattage } from '@/logic/wattage';
import { colors, spacing } from '@/theme';
import { BuildState } from '@/types/product';
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface PriceSummaryProps {
  build: BuildState;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({ build }) => {
  const totalPrice = calculateTotalPrice(build);
  const wattage = calculateWattage(build);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Total Price</Text>
        <Text style={styles.price}>${(totalPrice / 100).toFixed(2)}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Estimated Wattage</Text>
        <View style={styles.wattageContainer}>
          <Text style={styles.wattage}>{wattage}W</Text>
          <Text style={styles.wattageNote}>+20% headroom</Text>
        </View>
      </View>
      
      <View style={styles.separator} />
      
      <View style={styles.partCountRow}>
        <Text style={styles.partCountLabel}>Parts Selected:</Text>
        <Text style={styles.partCount}>
          {Object.values(build).filter(p => p !== null).length}/8
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.success,
  },
  wattageContainer: {
    alignItems: 'flex-end',
  },
  wattage: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.warning,
  },
  wattageNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  partCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partCountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  partCount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});