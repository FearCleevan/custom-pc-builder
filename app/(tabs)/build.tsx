import { CompatibilityBanner } from "@/components/CompatibilityBanner";
import { ComponentSelectionModal } from "@/components/ComponentSelectionModal";
import ConfirmationModal from "@/components/ConfirmationModal/ConfirmationModal";
import { PriceSummary } from "@/components/PriceSummary";
import { allComponents, getPrebuiltSeries } from "@/data/mockData";
import { checkCompatibility } from "@/logic/compatibility";
import { useBuildStore } from "@/store/useBuildStore";
import { THEME } from "@/theme/indexs";
import { Product, ProductType } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { colors: COLORS, spacing: SPACING, components: COMPONENTS, shadows: SHADOWS, borderRadius: BORDER_RADIUS } = THEME;

const BUILD_SLOTS = [
  { type: "cpu" as ProductType, label: "CPU", icon: "hardware-chip-outline", maxQuantity: 1 },
  { type: "gpu" as ProductType, label: "GPU", icon: "game-controller-outline", maxQuantity: 1 },
  { type: "motherboard" as ProductType, label: "Motherboard", icon: "grid-outline", maxQuantity: 1 },
  { type: "ram" as ProductType, label: "RAM", icon: "albums-outline", maxQuantity: 4 },
  { type: "cooler" as ProductType, label: "CPU Cooler", icon: "snow-outline", maxQuantity: 1 },
  { type: "storage" as ProductType, label: "Storage", icon: "save-outline", maxQuantity: 4 },
  { type: "psu" as ProductType, label: "Power Supply", icon: "flash-outline", maxQuantity: 1 },
  { type: "case" as ProductType, label: "Case", icon: "cube-outline", maxQuantity: 1 },
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
    cpu,
    gpu,
    motherboard,
    ram,
    cooler,
    storage,
    psu,
    case: casePart,
  };

  const compatibilityIssues = checkCompatibility(buildState);
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [selectedSlotType, setSelectedSlotType] = useState<ProductType | null>(null);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'warning' | 'danger' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    destructive?: boolean;
    slotType?: ProductType | null;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Handle pre-built series loading
  useEffect(() => {
    if (params.series) {
      const series = getPrebuiltSeries(params.series as string);
      if (series && series.components) {
        // Clear existing build
        clearBuild();

        // Load series components
        Object.entries(series.components).forEach(([type, componentId]) => {
          const component = allComponents.find((c) => c.id === componentId);
          if (component) {
            addPart(type as ProductType, component);
          }
        });

        Alert.alert(
          "Build Loaded",
          `${series.name} components have been loaded into your build.`,
          [{ text: "OK" }],
        );
      }
    }

    if (params.components) {
      try {
        const components = JSON.parse(params.components as string);
        Object.entries(components).forEach(([type, componentId]) => {
          const component = allComponents.find((c) => c.id === componentId);
          if (component) {
            addPart(type as ProductType, component);
          }
        });
      } catch (error) {
        console.error("Error parsing components:", error);
      }
    }
  }, [params.series, params.components, clearBuild, addPart]);

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
    const product = getProductForSlot(type);

    setConfirmationModal({
      visible: true,
      title: "Remove Component",
      message: `Are you sure you want to remove ${product?.name || 'this component'} from your build?`,
      type: "warning",
      confirmText: "REMOVE",
      cancelText: "CANCEL",
      onConfirm: () => {
        removePart(type);
        setExpandedSlot(null);
        setConfirmationModal(prev => ({ ...prev, visible: false }));
      },
      slotType: type,
    });
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
    const hasBuild = Object.values(buildState).some(
      (product) => product !== null,
    );

    if (!hasBuild) {
      setConfirmationModal({
        visible: true,
        title: "Empty Build",
        message: "Please add some components to your build first.",
        type: "info",
        confirmText: "OK",
        cancelText: "", // Empty string to hide cancel button
        onConfirm: () => {
          setConfirmationModal(prev => ({ ...prev, visible: false }));
        },
      });
      return;
    }

    setConfirmationModal({
      visible: true,
      title: "Save Build",
      message: "Save your current build configuration?",
      type: "info",
      confirmText: "SAVE",
      cancelText: "CANCEL",
      onConfirm: () => {
        // Your save logic here
        Alert.alert(
          "Save Build",
          "This feature will be available when connected to Supabase.",
          [{ text: "OK" }],
        );
        setConfirmationModal(prev => ({ ...prev, visible: false }));
      },
    });
  };

  const handleViewComponentDetails = (component: Product) => {
    router.push({
      pathname: "/(modals)/component-details",
      params: {
        id: component.id,
        type: component.type,
        from: "build",
      },
    });
  };

  const handleQuantityChange = (type: ProductType, delta: number) => {
    const product = getProductForSlot(type);
    if (product && ['ram', 'storage'].includes(type)) {
      const currentQuantity = product.quantity || 1;
      const maxQuantity = BUILD_SLOTS.find(s => s.type === type)?.maxQuantity || 1;
      const newQuantity = Math.max(1, Math.min(maxQuantity, currentQuantity + delta));

      // Update product with new quantity
      const updatedProduct = { ...product, quantity: newQuantity };
      addPart(type, updatedProduct);
    }
  };

  // Helper function to get product for a slot
  const getProductForSlot = (slotType: ProductType) => {
    switch (slotType) {
      case "cpu":
        return cpu;
      case "gpu":
        return gpu;
      case "motherboard":
        return motherboard;
      case "ram":
        return ram;
      case "cooler":
        return cooler;
      case "storage":
        return storage;
      case "psu":
        return psu;
      case "case":
        return casePart;
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient 
        colors={THEME.colors.gradients.dark}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Build Your PC</Text>
          <Text style={styles.subtitle}>
            Select components for your dream rig
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <View style={[styles.statIcon, { backgroundColor: COMPONENTS.badge.primary.backgroundColor }]}>
              <Ionicons name="hardware-chip" size={18} color={COMPONENTS.badge.primary.textColor} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                {Object.values(buildState).filter(Boolean).length}
              </Text>
              <Text style={styles.statLabel}>Components</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.stat}>
            <View style={[
              styles.statIcon, 
              { 
                backgroundColor: compatibilityIssues.length === 0 
                  ? COMPONENTS.badge.success.backgroundColor 
                  : COMPONENTS.badge.warning.backgroundColor 
              }
            ]}>
              <Ionicons
                name={compatibilityIssues.length === 0 ? "checkmark-shield" : "warning"}
                size={18}
                color={compatibilityIssues.length === 0 ? COMPONENTS.badge.success.textColor : COMPONENTS.badge.warning.textColor}
              />
            </View>
            <View style={styles.statContent}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: compatibilityIssues.length === 0 ? COMPONENTS.badge.success.textColor : COMPONENTS.badge.warning.textColor,
                  },
                ]}
              >
                {compatibilityIssues.length === 0 ? "All Good" : `${compatibilityIssues.length} Issues`}
              </Text>
              <Text style={styles.statLabel}>Compatibility</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <CompatibilityBanner issues={compatibilityIssues} />

      {/* Build Slots */}
      <View style={styles.slotsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Components Selection</Text>
          <Text style={styles.sectionSubtitle}>
            Add components to build your perfect PC
          </Text>
        </View>

        {BUILD_SLOTS.map((slot) => {
          const product = getProductForSlot(slot.type);
          const isExpanded = expandedSlot === slot.type;
          const maxQuantity = BUILD_SLOTS.find(s => s.type === slot.type)?.maxQuantity || 1;

          return (
            <View key={slot.type} style={styles.slotWrapper}>
              <TouchableOpacity
                style={[
                  styles.slotHeader,
                  isExpanded && styles.slotHeaderExpanded,
                ]}
                onPress={() => handleSlotPress(slot.type)}
                activeOpacity={0.8}
              >
                <View style={styles.slotHeaderLeft}>
                  <View style={[
                    styles.slotIconContainer,
                    product && styles.slotIconContainerSelected
                  ]}>
                    <Ionicons
                      name={slot.icon as any}
                      size={20}
                      color={product ? COLORS.primary : COLORS.text.tertiary}
                    />
                  </View>
                  <Text style={styles.slotTitle}>{slot.label}</Text>
                </View>

                <View style={styles.slotHeaderRight}>
                  {product ? (
                    <>
                      <View style={[styles.selectedBadge, { 
                        backgroundColor: COMPONENTS.badge.primary.backgroundColor,
                        borderColor: COMPONENTS.badge.primary.borderColor
                      }]}>
                        <Text style={[styles.selectedBadgeText, { 
                          color: COMPONENTS.badge.primary.textColor 
                        }]}>SELECTED</Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={COLORS.text.secondary}
                      />
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddPart(slot.type)}
                    >
                      <Ionicons name="add" size={18} color={COLORS.primary} />
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>

              {isExpanded && product && (
                <View style={styles.slotContent}>
                  <View style={styles.selectedComponent}>
                    {/* Component Image and Info */}
                    <View style={styles.componentImageContainer}>
                      {/* Product Image */}
                      <View style={styles.componentImagePlaceholder}>
                        {product.image ? (
                          <Image
                            source={{ uri: product.image }}
                            style={styles.componentImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Ionicons 
                            name={slot.icon as any} 
                            size={24} 
                            color={COLORS.text.tertiary} 
                          />
                        )}
                      </View>

                      <View style={styles.componentInfo}>
                        <Text style={styles.componentName} numberOfLines={2}>
                          {product.name}
                        </Text>

                        {/* Quantity Selector for multi-select components */}
                        {['ram', 'storage'].includes(slot.type) && (
                          <View style={styles.quantitySelector}>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => handleQuantityChange(slot.type, -1)}
                              disabled={(product as any).quantity <= 1}
                            >
                              <Ionicons name="remove" size={14} color={COLORS.text.primary} />
                            </TouchableOpacity>

                            <Text style={styles.quantityText}>
                              {(product as any).quantity || 1} {slot.type === 'ram' ? 'sticks' : 'drives'}
                            </Text>

                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => handleQuantityChange(slot.type, 1)}
                              disabled={((product as any).quantity || 1) >= maxQuantity}
                            >
                              <Ionicons name="add" size={14} color={COLORS.text.primary} />
                            </TouchableOpacity>
                          </View>
                        )}

                        <Text style={styles.componentPrice}>
                          ₱{(product.price * ((product as any).quantity || 1)).toLocaleString()}
                        </Text>

                        <View style={[
                          styles.stockBadge,
                          {
                            backgroundColor: product.stock === "In stock"
                              ? COMPONENTS.badge.success.backgroundColor
                              : COMPONENTS.badge.danger.backgroundColor,
                            borderColor: product.stock === "In stock"
                              ? COMPONENTS.badge.success.borderColor
                              : COMPONENTS.badge.danger.borderColor,
                          },
                        ]}>
                          <View style={[
                            styles.stockDot,
                            {
                              backgroundColor: product.stock === "In stock"
                                ? COMPONENTS.badge.success.textColor
                                : COMPONENTS.badge.danger.textColor,
                            },
                          ]} />
                          <Text style={[
                            styles.stockText,
                            {
                              color: product.stock === "In stock"
                                ? COMPONENTS.badge.success.textColor
                                : COMPONENTS.badge.danger.textColor,
                            },
                          ]}>
                            {product.stock}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.componentActions}>
                      <TouchableOpacity
                        style={[styles.changeButton, { 
                          backgroundColor: COMPONENTS.badge.primary.backgroundColor,
                          borderColor: COMPONENTS.badge.primary.borderColor
                        }]}
                        onPress={() => handleAddPart(slot.type)}
                      >
                        <Ionicons name="swap-horizontal" size={14} color={COMPONENTS.badge.primary.textColor} />
                        <Text style={[styles.changeButtonText, { color: COMPONENTS.badge.primary.textColor }]}>Change</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.viewDetailsButton, { 
                          backgroundColor: COMPONENTS.badge.secondary.backgroundColor,
                          borderColor: COMPONENTS.badge.secondary.borderColor
                        }]}
                        onPress={() => handleViewComponentDetails(product)}
                      >
                        <Text style={[styles.viewDetailsText, { color: COMPONENTS.badge.secondary.textColor }]}>Details</Text>
                        <Ionicons name="arrow-forward" size={14} color={COMPONENTS.badge.secondary.textColor} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.removeButton, { 
                          backgroundColor: COMPONENTS.badge.danger.backgroundColor,
                          borderColor: COMPONENTS.badge.danger.borderColor
                        }]}
                        onPress={() => handleRemovePart(slot.type)}
                      >
                        <Ionicons name="trash-outline" size={14} color={COMPONENTS.badge.danger.textColor} />
                        <Text style={[styles.removeButtonText, { color: COMPONENTS.badge.danger.textColor }]}>Remove</Text>
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
            colors={THEME.colors.gradients.primary}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="save" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>SAVE BUILD</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: COMPONENTS.button.danger.borderColor }]}
          onPress={() => {
            const hasBuild = Object.values(buildState).some(
              (product) => product !== null,
            );

            if (!hasBuild) {
              Alert.alert(
                "Empty Build",
                "Your build is already empty.",
              );
              return;
            }

            setConfirmationModal({
              visible: true,
              title: "Clear Build",
              message: "Are you sure you want to clear all components from your build? This action cannot be undone.",
              type: "danger",
              confirmText: "CLEAR ALL",
              cancelText: "CANCEL",
              destructive: true,
              onConfirm: () => {
                clearBuild();
                setConfirmationModal(prev => ({ ...prev, visible: false }));
              },
            });
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.secondaryButtonInner, { backgroundColor: COMPONENTS.button.secondary.backgroundColor }]}>
            <Ionicons name="trash" size={18} color={COMPONENTS.button.danger.textColor} />
            <Text style={[styles.secondaryButtonText, { color: COMPONENTS.button.danger.textColor }]}>CLEAR BUILD</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Browse Pre-Built Series Section */}
      <View style={styles.prebuiltSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Need Inspiration?</Text>
          <Text style={styles.sectionSubtitle}>
            Start with a professionally configured build
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.prebuiltCard, { 
            backgroundColor: COMPONENTS.card.default.backgroundColor,
            borderColor: COMPONENTS.card.default.borderColor
          }]}
          onPress={() => router.push("/prebuilt-series")}
          activeOpacity={0.8}
        >
          <View style={styles.prebuiltCardContent}>
            <View style={styles.prebuiltIconContainer}>
              <View style={[styles.prebuiltIconWrapper, { backgroundColor: COMPONENTS.badge.secondary.backgroundColor }]}>
                <Ionicons name="cube" size={28} color={COMPONENTS.badge.secondary.textColor} />
              </View>
            </View>

            <View style={styles.prebuiltInfo}>
              <Text style={[styles.prebuiltTitle, { color: COMPONENTS.badge.secondary.textColor }]}>
                BROWSE PRE-BUILT SERIES
              </Text>
              <Text style={styles.prebuiltDescription}>
                Explore curated builds for gaming, workstations, and industrial applications
              </Text>

              <View style={styles.prebuiltTags}>
                <View style={[styles.tag, { backgroundColor: COMPONENTS.badge.primary.backgroundColor }]}>
                  <Text style={[styles.tagText, { color: COMPONENTS.badge.primary.textColor }]}>Gaming PC</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: COMPONENTS.badge.info.backgroundColor }]}>
                  <Text style={[styles.tagText, { color: COMPONENTS.badge.info.textColor }]}>Workstation</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: COMPONENTS.badge.success.backgroundColor }]}>
                  <Text style={[styles.tagText, { color: COMPONENTS.badge.success.textColor }]}>Industrial</Text>
                </View>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={24} color={COLORS.text.tertiary} />
          </View>

          <View style={[styles.exploreButton, { backgroundColor: COMPONENTS.button.primary.backgroundColor }]}>
            <Text style={styles.exploreButtonText}>EXPLORE SERIES</Text>
            <Ionicons name="rocket" size={14} color="#FFF" />
          </View>
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
          currentComponent={
            selectedSlotType ? getProductForSlot(selectedSlotType) : null
          }
        />
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmationModal.visible}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal(prev => ({ ...prev, visible: false }))}
        destructive={confirmationModal.destructive}
        customContent={confirmationModal.slotType ? (
          <View style={{ alignItems: 'center', padding: SPACING.sm }}>
            <Ionicons 
              name={BUILD_SLOTS.find(s => s.type === confirmationModal.slotType)?.icon as any} 
              size={20} 
              color={COLORS.primary} 
            />
            <Text style={{ color: COLORS.text.tertiary, fontSize: 12, marginTop: 4 }}>
              Slot: {BUILD_SLOTS.find(s => s.type === confirmationModal.slotType)?.label}
            </Text>
          </View>
        ) : undefined}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl + 10,
    borderBottomLeftRadius: BORDER_RADIUS["2xl"],
    borderBottomRightRadius: BORDER_RADIUS["2xl"],
  },
  headerContent: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: THEME.typography.fontSizes["4xl"],
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.text.secondary,
    fontWeight: THEME.typography.fontWeights.normal,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.tertiary,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  slotsContainer: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes["2xl"],
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.text.secondary,
    fontWeight: THEME.typography.fontWeights.normal,
  },
  slotWrapper: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  slotHeaderExpanded: {
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  slotHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    flex: 1,
  },
  slotIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
  },
  slotIconContainerSelected: {
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  slotTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: COLORS.text.primary,
    flex: 1,
  },
  slotHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  selectedBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  selectedBadgeText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addButtonText: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: COLORS.primary,
  },
  slotContent: {
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceElevated,
  },
  selectedComponent: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  componentImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  componentImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  componentImage: {
    width: '100%',
    height: '100%',
  },
  componentInfo: {
    flex: 1,
  },
  componentName: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    lineHeight: THEME.typography.lineHeights.normal * THEME.typography.fontSizes.md,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quantityText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.secondary,
    marginHorizontal: SPACING.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  componentPrice: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.xs,
  },
  stockText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  componentActions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  changeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
    borderWidth: 1,
  },
  changeButtonText: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  viewDetailsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
    borderWidth: 1,
  },
  viewDetailsText: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  removeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
    borderWidth: 1,
  },
  removeButtonText: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  actionsContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  primaryButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    ...SHADOWS.primary,
  },
  buttonGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  secondaryButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
    borderWidth: 1,
  },
  secondaryButtonInner: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  secondaryButtonText: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  // Pre-built Series Section
  prebuiltSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  prebuiltCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    ...SHADOWS.md,
  },
  prebuiltCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  prebuiltIconContainer: {
    marginRight: SPACING.md,
  },
  prebuiltIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  prebuiltInfo: {
    flex: 1,
  },
  prebuiltTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    marginBottom: SPACING.xs,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  prebuiltDescription: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
    lineHeight: THEME.typography.lineHeights.normal * THEME.typography.fontSizes.sm,
  },
  prebuiltTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.semibold,
    letterSpacing: THEME.typography.letterSpacing.normal,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  exploreButtonText: {
    color: COLORS.white,
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
});