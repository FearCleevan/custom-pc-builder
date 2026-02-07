import { BuildSlot } from '@/components/BuildSlot';
import { CompatibilityBanner } from '@/components/CompatibilityBanner';
import { PriceSummary } from '@/components/PriceSummary';
import { checkCompatibility } from '@/logic/compatibility';
import { useBuildStore } from '@/store/useBuildStore';
import { colors, spacing } from '@/theme';
import { ProductType } from '@/types/product';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const BUILD_SLOTS = [
  { type: 'cpu' as ProductType, label: 'CPU' },
  { type: 'gpu' as ProductType, label: 'GPU' },
  { type: 'motherboard' as ProductType, label: 'Motherboard' },
  { type: 'ram' as ProductType, label: 'RAM' },
  { type: 'cooler' as ProductType, label: 'CPU Cooler' },
  { type: 'storage' as ProductType, label: 'Storage' },
  { type: 'psu' as ProductType, label: 'Power Supply' },
  { type: 'case' as ProductType, label: 'Case' },
] as const;

export default function BuildScreen() {
  const router = useRouter();
  
  // Use Zustand store instead of Context
  const cpu = useBuildStore((state) => state.cpu);
  const gpu = useBuildStore((state) => state.gpu);
  const motherboard = useBuildStore((state) => state.motherboard);
  const ram = useBuildStore((state) => state.ram);
  const cooler = useBuildStore((state) => state.cooler);
  const storage = useBuildStore((state) => state.storage);
  const psu = useBuildStore((state) => state.psu);
  const casePart = useBuildStore((state) => state.case);
  const addPart = useBuildStore((state) => state.addPart);
  const removePart = useBuildStore((state) => state.removePart);
  const clearBuild = useBuildStore((state) => state.clearBuild);
  
  // Create build state object for compatibility check
  const buildState = {
    cpu, gpu, motherboard, ram, cooler, storage, psu, case: casePart
  };
  
  const compatibilityIssues = checkCompatibility(buildState);
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);

  const handleSlotPress = (slotType: string) => {
    if (expandedSlot === slotType) {
      setExpandedSlot(null);
    } else {
      setExpandedSlot(slotType);
    }
  };

  const handleAddPart = (type: ProductType) => {
    router.push({
      pathname: '/(tabs)/explore',
      params: { type }
    });
  };

  const handleRemovePart = (type: ProductType) => {
    Alert.alert(
      'Remove Component',
      'Are you sure you want to remove this component?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            removePart(type);
            setExpandedSlot(null);
          }
        },
      ]
    );
  };

  const handleSaveBuild = () => {
    const hasBuild = Object.values(buildState).some(product => product !== null);
    if (!hasBuild) {
      Alert.alert('Empty Build', 'Please add some components to your build first.');
      return;
    }

    Alert.alert(
      'Save Build',
      'This feature will be available when connected to Supabase.',
      [{ text: 'OK' }]
    );
  };

  // Helper function to get product for a slot
  const getProductForSlot = (slotType: ProductType) => {
    switch (slotType) {
      case 'cpu': return cpu;
      case 'gpu': return gpu;
      case 'motherboard': return motherboard;
      case 'ram': return ram;
      case 'cooler': return cooler;
      case 'storage': return storage;
      case 'psu': return psu;
      case 'case': return casePart;
      default: return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Build Your PC</Text>
        <Text style={styles.subtitle}>Select components for your build</Text>
      </View>

      <CompatibilityBanner issues={compatibilityIssues} />

      <View style={styles.slotsContainer}>
        {BUILD_SLOTS.map((slot) => {
          const product = getProductForSlot(slot.type);
          
          return (
            <View key={slot.type} style={styles.slotWrapper}>
              <TouchableOpacity 
                style={styles.slotHeader}
                onPress={() => handleSlotPress(slot.type)}
              >
                <Text style={styles.slotTitle}>{slot.label}</Text>
                <Text style={styles.slotStatus}>
                  {product ? '✓ Selected' : '+ Add'}
                </Text>
              </TouchableOpacity>

              {expandedSlot === slot.type && (
                <View style={styles.slotContent}>
                  <BuildSlot
                    type={slot.type}
                    product={product}
                    onAddPress={() => handleAddPart(slot.type)}
                    onRemovePress={() => handleRemovePart(slot.type)}
                  />
                  
                  {product && (
                    <TouchableOpacity 
                      style={styles.viewDetailsButton}
                      onPress={() => router.push({
                        pathname: '/(tabs)/explore',
                        params: { 
                          type: slot.type,
                          preSelectedId: product.id 
                        }
                      })}
                    >
                      <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <PriceSummary build={buildState} />

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.saveButton]}
          onPress={handleSaveBuild}
        >
          <Text style={styles.saveButtonText}>Save Build</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.clearButton]}
          onPress={() => {
            Alert.alert(
              'Clear Build',
              'Are you sure you want to clear all components?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Clear All', 
                  style: 'destructive',
                  onPress: clearBuild
                },
              ]
            );
          }}
        >
          <Text style={styles.clearButtonText}>Clear Build</Text>
        </TouchableOpacity>
      </View>
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
  slotsContainer: {
    padding: spacing.lg,
  },
  slotWrapper: {
    marginBottom: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  slotTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  slotStatus: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  slotContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewDetailsButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  actionButton: {
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.success,
  },
  saveButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.error,
  },
  clearButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
});