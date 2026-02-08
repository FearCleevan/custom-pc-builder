import { CompatibilityBanner } from '@/components/CompatibilityBanner';
import { ComponentSelectionModal } from '@/components/ComponentSelectionModal';
import { PriceSummary } from '@/components/PriceSummary';
import { allComponents, getPrebuiltSeries } from '@/data/mockData';
import { checkCompatibility } from '@/logic/compatibility';
import { useBuildStore } from '@/store/useBuildStore';
import { spacing } from '@/theme';
import { Product, ProductType } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BUILD_SLOTS = [
  { type: 'cpu' as ProductType, label: 'CPU', icon: 'hardware-chip-outline' },
  { type: 'gpu' as ProductType, label: 'GPU', icon: 'game-controller-outline' },
  { type: 'motherboard' as ProductType, label: 'Motherboard', icon: 'grid-outline' },
  { type: 'ram' as ProductType, label: 'RAM', icon: 'albums-outline' },
  { type: 'cooler' as ProductType, label: 'CPU Cooler', icon: 'snow-outline' },
  { type: 'storage' as ProductType, label: 'Storage', icon: 'save-outline' },
  { type: 'psu' as ProductType, label: 'Power Supply', icon: 'flash-outline' },
  { type: 'case' as ProductType, label: 'Case', icon: 'cube-outline' },
] as const;

export default function BuildScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Use Zustand store
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
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [selectedSlotType, setSelectedSlotType] = useState<ProductType | null>(null);

  // Handle pre-built series loading
  useEffect(() => {
    if (params.series) {
      const series = getPrebuiltSeries(params.series as string);
      if (series && series.components) {
        // Clear existing build
        clearBuild();
        
        // Load series components
        Object.entries(series.components).forEach(([type, componentId]) => {
          const component = allComponents.find(c => c.id === componentId);
          if (component) {
            addPart(type as ProductType, component);
          }
        });
        
        Alert.alert(
          'Build Loaded',
          `${series.name} components have been loaded into your build.`,
          [{ text: 'OK' }]
        );
      }
    }
    
    if (params.components) {
      try {
        const components = JSON.parse(params.components as string);
        Object.entries(components).forEach(([type, componentId]) => {
          const component = allComponents.find(c => c.id === componentId);
          if (component) {
            addPart(type as ProductType, component);
          }
        });
      } catch (error) {
        console.error('Error parsing components:', error);
      }
    }
  }, [params.series, params.components]);

  const handleSlotPress = (slotType: string) => {
    if (expandedSlot === slotType) {
      setExpandedSlot(null);
    } else {
      setExpandedSlot(slotType);
    }
  };

  const handleAddPart = (type: ProductType) => {
    setSelectedSlotType(type);
    setShowComponentModal(true);
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

const handleComponentSelect = (component: Product | null) => {
  if (selectedSlotType) {
    if (component) {
      addPart(selectedSlotType, component);
    } else {
      removePart(selectedSlotType);
    }
    setShowComponentModal(false);
    setSelectedSlotType(null);
    
    // Auto-expand the slot to show the selected component
    if (component) {
      setExpandedSlot(selectedSlotType);
    } else {
      setExpandedSlot(null);
    }
  }
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

  const handleViewComponentDetails = (component: Product) => {
    router.push({
      pathname: '/(modals)/component-details',
      params: {
        id: component.id,
        type: component.type,
        from: 'build'
      }
    });
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#000000', '#1a1a2e']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Build Your PC</Text>
          <Text style={styles.subtitle}>Select components for your dream rig</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="speedometer" size={20} color="#FF00FF" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                {Object.values(buildState).filter(Boolean).length}/8
              </Text>
              <Text style={styles.statLabel}>Components</Text>
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.stat}>
            <Ionicons name="shield-checkmark" size={20} color={compatibilityIssues.length === 0 ? '#00FF00' : '#FF0000'} />
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: compatibilityIssues.length === 0 ? '#00FF00' : '#FF0000' }]}>
                {compatibilityIssues.length === 0 ? '✓' : '⚠'}
              </Text>
              <Text style={styles.statLabel}>Compatibility</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <CompatibilityBanner issues={compatibilityIssues} />

      {/* Build Slots */}
      <View style={styles.slotsContainer}>
        <Text style={styles.sectionTitle}>Components Selection</Text>
        <Text style={styles.sectionSubtitle}>Add components to build your perfect PC</Text>
        
        {BUILD_SLOTS.map((slot) => {
          const product = getProductForSlot(slot.type);
          const isExpanded = expandedSlot === slot.type;
          
          return (
            <View key={slot.type} style={styles.slotWrapper}>
              <TouchableOpacity 
                style={[styles.slotHeader, isExpanded && styles.slotHeaderExpanded]}
                onPress={() => handleSlotPress(slot.type)}
                activeOpacity={0.8}
              >
                <View style={styles.slotHeaderLeft}>
                  <View style={styles.slotIconContainer}>
                    <Ionicons name={slot.icon as any} size={20} color={product ? '#FF00FF' : '#666'} />
                    {product && <View style={styles.slotSelectedGlow} />}
                  </View>
                  <Text style={styles.slotTitle}>{slot.label}</Text>
                </View>
                
                <View style={styles.slotHeaderRight}>
                  {product ? (
                    <>
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>SELECTED</Text>
                      </View>
                      <Ionicons 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color="#FF00FF" 
                      />
                    </>
                  ) : (
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => handleAddPart(slot.type)}
                    >
                      <Ionicons name="add-circle" size={20} color="#00FFFF" />
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>

              {isExpanded && product && (
                <View style={styles.slotContent}>
                  <View style={styles.selectedComponent}>
                    <View style={styles.componentInfo}>
                      <Text style={styles.componentName} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <Text style={styles.componentPrice}>
                        ₱{product.price.toLocaleString()}
                      </Text>
                      <View style={[
                        styles.stockBadge,
                        { backgroundColor: product.stock === 'In stock' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)' }
                      ]}>
                        <View style={[
                          styles.stockDot,
                          { backgroundColor: product.stock === 'In stock' ? '#00FF00' : '#FF0000' }
                        ]} />
                        <Text style={[
                          styles.stockText,
                          { color: product.stock === 'In stock' ? '#00FF00' : '#FF0000' }
                        ]}>
                          {product.stock}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.componentActions}>
                      <TouchableOpacity 
                        style={styles.viewDetailsButton}
                        onPress={() => handleViewComponentDetails(product)}
                      >
                        <Text style={styles.viewDetailsText}>View Details</Text>
                        <Ionicons name="arrow-forward" size={16} color="#00FFFF" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => handleRemovePart(slot.type)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FF0000" />
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <PriceSummary build={buildState} />

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleSaveBuild}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF00FF', '#9400D3']}
            style={styles.buttonGradient}
          >
            <Ionicons name="save" size={24} color="#FFF" />
            <Text style={styles.primaryButtonText}>
              SAVE BUILD
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
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
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.secondaryButtonGradient}
          >
            <Ionicons name="trash" size={20} color="#FF0000" />
            <Text style={styles.secondaryButtonText}>
              CLEAR BUILD
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Browse Pre-Built Series Section */}
      <View style={styles.prebuiltSection}>
        <View style={styles.prebuiltHeader}>
          <Text style={styles.sectionTitle}>Need Inspiration?</Text>
          <Text style={styles.sectionSubtitle}>
            Start with a professionally configured build
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.prebuiltCard}
          onPress={() => router.push('/prebuilt-series')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(0, 255, 255, 0.1)', 'rgba(0, 255, 255, 0.05)']}
            style={styles.prebuiltCardGradient}
          >
            <View style={styles.prebuiltCardContent}>
              <View style={styles.prebuiltIconContainer}>
                <Ionicons name="cube" size={32} color="#00FFFF" />
                <View style={styles.prebuiltIconGlow} />
              </View>
              
              <View style={styles.prebuiltInfo}>
                <Text style={styles.prebuiltTitle}>
                  BROWSE PRE-BUILT SERIES
                </Text>
                <Text style={styles.prebuiltDescription}>
                  Explore curated builds for gaming, workstations, and industrial applications
                </Text>
                
                <View style={styles.prebuiltTags}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Gaming PC</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Workstation</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Industrial</Text>
                  </View>
                </View>
              </View>
              
              <Ionicons name="arrow-forward-circle" size={32} color="#00FFFF" />
            </View>
            
            <LinearGradient
              colors={['#00FFFF', '#008B8B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.exploreButton}
            >
              <Text style={styles.exploreButtonText}>EXPLORE SERIES</Text>
              <Ionicons name="rocket" size={16} color="#FFF" />
            </LinearGradient>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Component Selection Modal */}
      <Modal
        visible={showComponentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowComponentModal(false);
          setSelectedSlotType(null);
        }}
      >
        <ComponentSelectionModal
          slotType={selectedSlotType}
          onSelect={handleComponentSelect}
          onClose={() => {
            setShowComponentModal(false);
            setSelectedSlotType(null);
          }}
          currentComponent={selectedSlotType ? getProductForSlot(selectedSlotType) : null}
        />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.xxl + 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(255, 0, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF00FF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: spacing.md,
  },
  slotsContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.xl,
  },
  slotWrapper: {
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  slotHeaderExpanded: {
    backgroundColor: 'rgba(255, 0, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 0, 255, 0.2)',
  },
  slotHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  slotIconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSelectedGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: '#FF00FF',
    opacity: 0.2,
    borderRadius: 17,
  },
  slotTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
  },
  slotHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  selectedBadge: {
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF00FF',
    letterSpacing: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FFFF',
  },
  slotContent: {
    padding: spacing.lg,
  },
  selectedComponent: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  componentInfo: {
    marginBottom: spacing.lg,
  },
  componentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  componentPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF00FF',
    marginBottom: spacing.sm,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  componentActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  viewDetailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FFFF',
  },
  removeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF0000',
  },
  actionsContainer: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  secondaryButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  secondaryButtonText: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  // Pre-built Series Section
  prebuiltSection: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 20,
    marginTop: spacing.lg,
  },
  prebuiltHeader: {
    marginBottom: spacing.lg,
  },
  prebuiltCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  prebuiltCardGradient: {
    padding: spacing.lg,
  },
  prebuiltCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  prebuiltIconContainer: {
    position: 'relative',
    marginRight: spacing.lg,
  },
  prebuiltIconGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#00FFFF',
    opacity: 0.2,
    borderRadius: 26,
  },
  prebuiltInfo: {
    flex: 1,
  },
  prebuiltTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00FFFF',
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  prebuiltDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  prebuiltTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  tagText: {
    fontSize: 12,
    color: '#00FFFF',
    fontWeight: '600',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});