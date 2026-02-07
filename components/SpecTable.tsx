import { colors, spacing } from '@/theme';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface SpecTableProps {
  specs: Record<string, any>;
  compareMode?: boolean;
}

export const SpecTable: React.FC<SpecTableProps> = ({ specs, compareMode = false }) => {
  const entries = Object.entries(specs);

  return (
    <ScrollView 
      style={[styles.container, compareMode && styles.compareContainer]}
      showsVerticalScrollIndicator={false}
    >
      {entries.map(([key, value]) => (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>{key}</Text>
          <Text style={styles.value}>{String(value)}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: spacing.md,
  },
  compareContainer: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
});