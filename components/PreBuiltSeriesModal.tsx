import { allComponents } from '@/data/mockData';
import { spacing } from '@/theme';
import { PrebuiltSeries } from '@/types/mockData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;

interface PreBuiltSeriesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSeries: (seriesId: string) => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const PREBUILT_CATEGORIES = [
  { id: 'gaming', name: 'Gaming PC', icon: 'game-controller', description: 'High-performance gaming rigs' },
  { id: 'workstation', name: 'Workstation', icon: 'desktop', description: 'Professional content creation' },
  { id: 'industrial', name: 'Industrial', icon: 'construct', description: 'Industrial and server solutions' },
  { id: 'budget', name: 'Budget', icon: 'wallet', description: 'Cost-effective solutions' },
  { id: 'enthusiast', name: 'Enthusiast', icon: 'rocket', description: 'High-end performance builds' },
];

// Mock data for pre-built series (you should replace this with actual data from mockData)
const PREBUILT_SERIES_DATA: Record<string, PrebuiltSeries[]> = {
  gaming: [
    {
      id: 'gaming_pro',
      name: 'Gaming Pro',
      description: 'Ultimate gaming performance for 4K gaming',
      price: 120000,
      category: 'gaming',
      components: {
        cpu: 'cpu_amd_ryzen9_7950x',
        gpu: 'gpu_nvidia_rtx4090',
        motherboard: 'motherboard_asus_rog_strix_x670e',
        ram: 'ram_corsair_dominator_32gb',
        cooler: 'cooler_nzxt_kraken_z73',
        storage: 'storage_samsung_990pro_2tb',
        psu: 'psu_corsair_rm1000x',
        case: 'case_lian_li_o11_dynamic'
      }
    },
    {
      id: 'gaming_mid',
      name: 'Gaming Mid-Range',
      description: 'Excellent 1440p gaming performance',
      price: 80000,
      category: 'gaming',
      components: {
        cpu: 'cpu_intel_core_i7_14700k',
        gpu: 'gpu_nvidia_rtx4070ti',
        motherboard: 'motherboard_msi_z790',
        ram: 'ram_gskill_tridentz_16gb',
        cooler: 'cooler_corsair_h100i',
        storage: 'storage_wd_black_sn850x_1tb',
        psu: 'psu_seasonic_focus_gx750',
        case: 'case_nzxt_h7_flow'
      }
    },
    {
      id: 'gaming_budget',
      name: 'Gaming Budget',
      description: 'Great 1080p gaming at affordable price',
      price: 50000,
      category: 'gaming',
      components: {
        cpu: 'cpu_amd_ryzen5_7600x',
        gpu: 'gpu_amd_rx7700xt',
        motherboard: 'motherboard_gigabyte_b650',
        ram: 'ram_teamgroup_tforce_16gb',
        cooler: 'cooler_deepcool_ak620',
        storage: 'storage_crucial_p5_plus_1tb',
        psu: 'psu_evga_650_g6',
        case: 'case_fractal_pop_air'
      }
    }
  ],
  workstation: [
    {
      id: 'workstation_pro',
      name: 'Workstation Pro',
      description: 'Professional content creation and 3D rendering',
      price: 150000,
      category: 'workstation',
      components: {
        cpu: 'cpu_intel_core_i9_14900k',
        gpu: 'gpu_nvidia_rtx4090',
        motherboard: 'motherboard_asus_proart_z790',
        ram: 'ram_corsair_vengeance_64gb',
        cooler: 'cooler_arctic_liquid_freezer_ii_420',
        storage: 'storage_samsung_990pro_4tb',
        psu: 'psu_seasonic_prime_tx1000',
        case: 'case_fractal_design_define_7'
      }
    }
  ],
  industrial: [
    {
      id: 'industrial_server',
      name: 'Industrial Server',
      description: 'Reliable server solution for industrial applications',
      price: 100000,
      category: 'industrial',
      components: {
        cpu: 'cpu_intel_xeon_w7_2495x',
        gpu: 'gpu_nvidia_rtxa4000',
        motherboard: 'motherboard_supermicro_x13swa',
        ram: 'ram_kingston_server_128gb',
        cooler: 'cooler_noctua_nh_u14s',
        storage: 'storage_kingston_dc1500m_2tb',
        psu: 'psu_seasonic_prime_px1300',
        case: 'case_silverstone_rm51'
      }
    }
  ],
  budget: [
    {
      id: 'budget_office',
      name: 'Budget Office',
      description: 'Perfect for office work and everyday computing',
      price: 30000,
      category: 'budget',
      components: {
        cpu: 'cpu_amd_ryzen5_5600g',
        gpu: 'gpu_integrated',
        motherboard: 'motherboard_asus_prime_b550',
        ram: 'ram_kingston_fury_16gb',
        cooler: 'cooler_stock',
        storage: 'storage_wd_blue_sn570_1tb',
        psu: 'psu_corsair_cv550',
        case: 'case_montech_air_100'
      }
    }
  ],
  enthusiast: [
    {
      id: 'enthusiast_extreme',
      name: 'Enthusiast Extreme',
      description: 'No compromise extreme performance build',
      price: 200000,
      category: 'enthusiast',
      components: {
        cpu: 'cpu_amd_threadripper_7980x',
        gpu: 'gpu_nvidia_rtx4090',
        motherboard: 'motherboard_asus_rog_zenith_extreme',
        ram: 'ram_gskill_tridentz_128gb',
        cooler: 'cooler_ekwb_quantum_velocity',
        storage: 'storage_samsung_990pro_8tb',
        psu: 'psu_bequiet_dark_power_pro_12_1500w',
        case: 'case_thermaltake_tower_900'
      }
    }
  ]
};

export const PreBuiltSeriesModal: React.FC<PreBuiltSeriesModalProps> = ({
  visible,
  onClose,
  onSelectSeries,
  selectedCategory,
  onCategoryChange,
}) => {
  const seriesList = PREBUILT_SERIES_DATA[selectedCategory] || [];

  const renderSeriesCard = ({ item }: { item: PrebuiltSeries }) => {
    const totalComponents = Object.keys(item.components).length;
    
    return (
      <TouchableOpacity
        style={styles.seriesCard}
        onPress={() => onSelectSeries(item.id)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
          style={styles.cardGradient}
        >
          {/* Series Category */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {selectedCategory.toUpperCase()}
            </Text>
          </View>

          {/* Series Name */}
          <Text style={styles.seriesName} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Description */}
          <Text style={styles.seriesDescription} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Component Count */}
          <View style={styles.componentsInfo}>
            <Ionicons name="cube" size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.componentsText}>
              {totalComponents} Components
            </Text>
          </View>

          {/* Component Preview */}
          <View style={styles.componentsPreview}>
            {Object.entries(item.components)
              .slice(0, 3)
              .map(([type, componentId]) => {
                const component = allComponents.find(c => c.id === componentId);
                if (!component) return null;
                
                return (
                  <View key={type} style={styles.componentPreview}>
                    <Ionicons 
                      name={getComponentIcon(type)} 
                      size={10} 
                      color="#00FFFF" 
                    />
                    <Text style={styles.componentPreviewText} numberOfLines={1}>
                      {component.name.split(' ')[0]}
                    </Text>
                  </View>
                );
              })}
            {Object.keys(item.components).length > 3 && (
              <Text style={styles.moreComponentsText}>
                +{Object.keys(item.components).length - 3} more
              </Text>
            )}
          </View>

          {/* Price */}
          <Text style={styles.seriesPrice}>
            ₱{item.price.toLocaleString()}
          </Text>

          {/* Customize Button */}
          <TouchableOpacity 
            style={styles.customizeButton}
            onPress={() => onSelectSeries(item.id)}
          >
            <LinearGradient
              colors={['#FF00FF', '#9400D3']}
              style={styles.customizeButtonGradient}
            >
              <Ionicons name="build" size={14} color="#FFF" />
              <Text style={styles.customizeButtonText}>CUSTOMIZE BUILD</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const getComponentIcon = (type: string) => {
    switch(type) {
      case 'cpu': return 'hardware-chip-outline';
      case 'gpu': return 'game-controller-outline';
      case 'motherboard': return 'grid-outline';
      case 'ram': return 'albums-outline';
      case 'cooler': return 'snow-outline';
      case 'storage': return 'save-outline';
      case 'psu': return 'flash-outline';
      case 'case': return 'cube-outline';
      default: return 'cube-outline';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <LinearGradient
            colors={['#0a0a0f', '#1a1a2e']}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderLeft}>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Pre-Built Series</Text>
            </View>
            <Text style={styles.modalSubtitle}>
              Select a series to customize
            </Text>
          </LinearGradient>

          {/* Category Tabs */}
          <View style={styles.categorySection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryTabs}
              contentContainerStyle={styles.categoryTabsContent}
            >
              {PREBUILT_CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryTab,
                    selectedCategory === category.id && styles.categoryTabActive
                  ]}
                  onPress={() => onCategoryChange(category.id)}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={14}
                    color={selectedCategory === category.id ? '#FF00FF' : 'rgba(255,255,255,0.7)'}
                    style={styles.categoryIcon}
                  />
                  <Text style={[
                    styles.categoryTabText,
                    selectedCategory === category.id && styles.categoryTabTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Series Grid */}
          {seriesList.length > 0 ? (
            <FlatList
              data={seriesList}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={false}
              renderItem={renderSeriesCard}
              ListFooterComponent={<View style={styles.listFooter} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="construct" size={64} color="#666" />
              <Text style={styles.emptyStateText}>
                No series found
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Coming soon for this category
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.closeButtonGradient}
              >
                <Text style={styles.closeButtonText}>CLOSE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    marginTop: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  categorySection: {
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  categoryTabs: {
    flexGrow: 0,
  },
  categoryTabsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: spacing.xs,
  },
  categoryTabActive: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderColor: '#FF00FF',
  },
  categoryIcon: {
    marginRight: spacing.xs,
  },
  categoryTabText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  categoryTabTextActive: {
    color: '#FF00FF',
  },
  grid: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  seriesCard: {
    width: CARD_WIDTH,
    marginRight: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: spacing.sm,
    height: 280,
    justifyContent: 'space-between',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  categoryBadgeText: {
    fontSize: 8,
    color: '#FF00FF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  seriesName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  seriesDescription: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.sm,
    lineHeight: 12,
  },
  componentsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  componentsText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  componentsPreview: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  componentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  componentPreviewText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    flex: 1,
  },
  moreComponentsText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    fontStyle: 'italic',
  },
  seriesPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FF00FF',
    marginBottom: spacing.sm,
  },
  customizeButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  customizeButtonGradient: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  customizeButtonText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  listFooter: {
    height: spacing.xxl,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});