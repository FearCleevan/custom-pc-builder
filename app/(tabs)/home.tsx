import { BuildSlot } from '@/components/BuildSlot';
import { CompatibilityBanner } from '@/components/CompatibilityBanner';
import { PriceSummary } from '@/components/PriceSummary';
import { checkCompatibility } from '@/logic/compatibility';
import { useBuildStore } from '@/store/useBuildStore';
import { colors, spacing } from '@/theme';
import { ProductType } from '@/types/product';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  
  // Access individual properties to avoid type issues
  const cpu = useBuildStore((state) => state.cpu);
  const gpu = useBuildStore((state) => state.gpu);
  const motherboard = useBuildStore((state) => state.motherboard);
  const ram = useBuildStore((state) => state.ram);
  const cooler = useBuildStore((state) => state.cooler);
  const storage = useBuildStore((state) => state.storage);
  const psu = useBuildStore((state) => state.psu);
  const casePart = useBuildStore((state) => state.case);
  const removePart = useBuildStore((state) => state.removePart);
  const clearBuild = useBuildStore((state) => state.clearBuild);
  const getTotalPrice = useBuildStore((state) => state.getTotalPrice);
  
  // Create build state object
  const buildState = {
    cpu, gpu, motherboard, ram, cooler, storage, psu, case: casePart
  };
  
  const totalPrice = getTotalPrice();
  const compatibilityIssues = checkCompatibility(buildState);
  const hasBuild = Object.values(buildState).some(product => product !== null);

  const buildSlots = [
    { type: 'cpu' as ProductType, product: cpu },
    { type: 'gpu' as ProductType, product: gpu },
    { type: 'motherboard' as ProductType, product: motherboard },
    { type: 'ram' as ProductType, product: ram },
    { type: 'cooler' as ProductType, product: cooler },
  ].filter(slot => slot.product);

  // Helper function to handle remove part with proper typing
  const handleRemovePart = (type: ProductType) => {
    removePart(type);
  };

  // Helper function to navigate to explore with proper typing
  const handleNavigateToExplore = (type: ProductType) => {
    router.push({
      pathname: '/(tabs)/explore',
      params: { type }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Custom PC Builder</Text>
        <Text style={styles.subtitle}>Your PC Building Companion</Text>
      </View>

      {!hasBuild ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Build Started</Text>
          <Text style={styles.emptyStateText}>
            Start building your dream PC by adding components!
          </Text>
          <TouchableOpacity 
            style={styles.startBuildingButton}
            onPress={() => router.push('/(tabs)/build')}
          >
            <Text style={styles.startBuildingButtonText}>Start Building</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>Build Overview</Text>
            
            <CompatibilityBanner issues={compatibilityIssues} />
            
            <PriceSummary build={buildState} />
            
            <Text style={styles.selectedPartsTitle}>Selected Parts</Text>
            {buildSlots.map((slot) => (
              <BuildSlot
                key={slot.type}
                type={slot.type}
                product={slot.product}
                onAddPress={() => handleNavigateToExplore(slot.type)}
                onRemovePress={() => handleRemovePart(slot.type)}
              />
            ))}
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.continueButton]}
              onPress={() => router.push('/(tabs)/build')}
            >
              <Text style={styles.continueButtonText}>Continue Building</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={clearBuild}
            >
              <Text style={styles.secondaryButtonText}>Clear Build</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight + 'CC',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  startBuildingButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: 12,
  },
  startBuildingButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '600',
  },
  overviewCard: {
    margin: spacing.lg,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: spacing.lg,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  selectedPartsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  actionsContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: colors.primary,
  },
  continueButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});