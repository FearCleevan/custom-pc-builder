import { CompatibilityBanner } from "@/components/CompatibilityBanner";
import { ComponentSelectionModal } from "@/components/ComponentSelectionModal";
import { PriceSummary } from "@/components/PriceSummary";
import { allComponents, getPrebuiltSeries } from "@/data/mockData";
import { checkCompatibility } from "@/logic/compatibility";
import { useBuildStore } from "@/store/useBuildStore";
import { spacing } from "@/theme";
import { Product, ProductType } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  const [selectedSlotType, setSelectedSlotType] = useState<ProductType | null>(
    null,
  );

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
    Alert.alert(
      "Remove Component",
      "Are you sure you want to remove this component?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removePart(type);
            setExpandedSlot(null);
          },
        },
      ],
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
    const hasBuild = Object.values(buildState).some(
      (product) => product !== null,
    );
    if (!hasBuild) {
      Alert.alert(
        "Empty Build",
        "Please add some components to your build first.",
      );
      return;
    }

    Alert.alert(
      "Save Build",
      "This feature will be available when connected to Supabase.",
      [{ text: "OK" }],
    );
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
      {/* Header - Compact Design */}
      <LinearGradient colors={["#000000", "#1a1a2e"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Build Your PC</Text>
          <Text style={styles.subtitle}>
            Select components for your dream rig
          </Text>
        </View>

        {/* Quick Stats - Compact */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="speedometer" size={18} color="#FF00FF" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                {Object.values(buildState).filter(Boolean).length}/8
              </Text>
              <Text style={styles.statLabel}>Components</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.stat}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={compatibilityIssues.length === 0 ? "#00FF00" : "#FF0000"}
            />
            <View style={styles.statContent}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      compatibilityIssues.length === 0 ? "#00FF00" : "#FF0000",
                  },
                ]}
              >
                {compatibilityIssues.length === 0 ? "✓" : "⚠"}
              </Text>
              <Text style={styles.statLabel}>Compatibility</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <CompatibilityBanner issues={compatibilityIssues} />

      {/* Build Slots - Compact */}
      <View style={styles.slotsContainer}>
        <Text style={styles.sectionTitle}>Components Selection</Text>
        <Text style={styles.sectionSubtitle}>
          Add components to build your perfect PC
        </Text>

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
                  <View style={styles.slotIconContainer}>
                    <Ionicons
                      name={slot.icon as any}
                      size={18}
                      color={product ? "#FF00FF" : "#666"}
                    />
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
                        size={18}
                        color="#FF00FF"
                      />
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddPart(slot.type)}
                    >
                      <Ionicons name="add-circle" size={16} color="#00FFFF" />
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
                          <Text style={styles.componentImageText}>
                            {slot.type.charAt(0).toUpperCase()}
                          </Text>
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
                              <Ionicons name="remove" size={14} color="#FFF" />
                            </TouchableOpacity>

                            <Text style={styles.quantityText}>
                              {(product as any).quantity || 1} {slot.type === 'ram' ? 'sticks' : 'drives'}
                            </Text>

                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => handleQuantityChange(slot.type, 1)}
                              disabled={((product as any).quantity || 1) >= maxQuantity}
                            >
                              <Ionicons name="add" size={14} color="#FFF" />
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
                              ? "rgba(0, 255, 0, 0.1)"
                              : "rgba(255, 0, 0, 0.1)",
                          },
                        ]}>
                          <View style={[
                            styles.stockDot,
                            {
                              backgroundColor: product.stock === "In stock"
                                ? "#00FF00"
                                : "#FF0000",
                            },
                          ]} />
                          <Text style={[
                            styles.stockText,
                            {
                              color: product.stock === "In stock"
                                ? "#00FF00"
                                : "#FF0000",
                            },
                          ]}>
                            {product.stock}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.componentActions}>
                      {/* Change Component Button */}
                      <TouchableOpacity
                        style={styles.changeButton}
                        onPress={() => handleAddPart(slot.type)}
                      >
                        <Ionicons name="swap-horizontal" size={14} color="#FF00FF" />
                        <Text style={styles.changeButtonText}>Change</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.viewDetailsButton}
                        onPress={() => handleViewComponentDetails(product)}
                      >
                        <Text style={styles.viewDetailsText}>Details</Text>
                        <Ionicons name="arrow-forward" size={14} color="#00FFFF" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemovePart(slot.type)}
                      >
                        <Ionicons name="trash-outline" size={14} color="#FF0000" />
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
            colors={["#FF00FF", "#9400D3"]}
            style={styles.buttonGradient}
          >
            <Ionicons name="save" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>SAVE BUILD</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            Alert.alert(
              "Clear Build",
              "Are you sure you want to clear all components?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear All",
                  style: "destructive",
                  onPress: clearBuild,
                },
              ],
            );
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
            style={styles.secondaryButtonGradient}
          >
            <Ionicons name="trash" size={18} color="#FF0000" />
            <Text style={styles.secondaryButtonText}>CLEAR BUILD</Text>
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
          onPress={() => router.push("/prebuilt-series")}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["rgba(0, 255, 255, 0.1)", "rgba(0, 255, 255, 0.05)"]}
            style={styles.prebuiltCardGradient}
          >
            <View style={styles.prebuiltCardContent}>
              <View style={styles.prebuiltIconContainer}>
                <Ionicons name="cube" size={28} color="#00FFFF" />
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

              <Ionicons name="arrow-forward-circle" size={28} color="#00FFFF" />
            </View>

            <LinearGradient
              colors={["#00FFFF", "#008B8B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.exploreButton}
            >
              <Text style={styles.exploreButtonText}>EXPLORE SERIES</Text>
              <Ionicons name="rocket" size={14} color="#FFF" />
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
          currentComponent={
            selectedSlotType ? getProductForSlot(selectedSlotType) : null
          }
        />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl + 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FF00FF",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: spacing.sm,
  },
  slotsContainer: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginBottom: spacing.lg,
  },
  slotWrapper: {
    marginBottom: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  slotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  slotHeaderExpanded: {
    backgroundColor: "rgba(255, 0, 255, 0.05)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 0, 255, 0.2)",
  },
  slotHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  slotIconContainer: {
    position: "relative",
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  slotSelectedGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: "#FF00FF",
    opacity: 0.15,
    borderRadius: 14,
  },
  slotTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
    flex: 1,
  },
  slotHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  selectedBadge: {
    backgroundColor: "rgba(255, 0, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectedBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FF00FF",
    letterSpacing: 0.5,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#00FFFF",
  },
  slotContent: {
    padding: spacing.md,
  },
  selectedComponent: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  componentImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  componentImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  componentImage: {
    width: '100%',
    height: '100%',
  },
  componentImageText: {
    fontSize: 20,
    fontWeight: '900',
    color: "rgba(255,255,255,0.2)",
  },
  componentInfo: {
    flex: 1,
  },
  componentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 6,
    lineHeight: 18,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginHorizontal: 8,
    fontWeight: '600',
  },
  componentPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FF00FF",
    marginBottom: 6,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  stockText: {
    fontSize: 10,
    fontWeight: "600",
  },
  componentActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  changeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 0, 255, 0.1)",
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 0, 255, 0.2)",
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF00FF",
  },
  viewDetailsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.2)",
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#00FFFF",
  },
  removeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.2)",
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF0000",
  },
  actionsContainer: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#FF00FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 0, 0, 0.2)",
  },
  secondaryButtonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#FF0000",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  // Pre-built Series Section
  prebuiltSection: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  prebuiltHeader: {
    marginBottom: spacing.md,
  },
  prebuiltCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.2)",
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  prebuiltCardGradient: {
    padding: spacing.md,
  },
  prebuiltCardContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  prebuiltIconContainer: {
    position: "relative",
    marginRight: spacing.md,
  },
  prebuiltIconGlow: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    backgroundColor: "#00FFFF",
    opacity: 0.15,
    borderRadius: 20,
  },
  prebuiltInfo: {
    flex: 1,
  },
  prebuiltTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#00FFFF",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  prebuiltDescription: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  prebuiltTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: "rgba(0, 255, 255, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.15)",
  },
  tagText: {
    fontSize: 10,
    color: "#00FFFF",
    fontWeight: "600",
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: 10,
    gap: 6,
  },
  exploreButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});