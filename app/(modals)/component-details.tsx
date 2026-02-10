import { allComponents } from '@/data/mockData';
import { useBuildStore } from '@/store/useBuildStore';
import { THEME } from '@/theme/indexs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { colors: COLORS, spacing: SPACING, borderRadius: BORDER_RADIUS, shadows: SHADOWS } = THEME;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIMILAR_PRODUCT_WIDTH = (SCREEN_WIDTH - SPACING.lg * 3) / 2.5;

export default function ComponentDetailsModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const componentId = params.id as string;
  const from = params.from as string;
  const slotType = params.slotType as string;
  
  const addPart = useBuildStore((state) => state.addPart);
  const getProductForSlot = (type: string) => {
    const store = useBuildStore.getState();
    switch (type) {
      case 'cpu': return store.cpu;
      case 'gpu': return store.gpu;
      case 'motherboard': return store.motherboard;
      case 'ram': return store.ram;
      case 'cooler': return store.cooler;
      case 'storage': return store.storage;
      case 'psu': return store.psu;
      case 'case': return store.case;
      default: return null;
    }
  };
  
  const component = allComponents.find(c => c.id === componentId);
  
  // Find similar products
  const similarProducts = useMemo(() => {
    if (!component) return [];
    
    return allComponents
      .filter(item => 
        item.type === component.type && 
        item.id !== component.id &&
        Math.abs(item.price - component.price) < component.price * 0.3 // Within 30% price range
      )
      .slice(0, 5);
  }, [component]);

  if (!component) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Component not found</Text>
      </View>
    );
  }

  // Check if this component is currently in the build
  const isInBuild = slotType ? getProductForSlot(slotType)?.id === componentId : false;

  const handleAddToBuild = () => {
    if (slotType) {
      addPart(slotType as any, component);
      Alert.alert(
        'Added to Build',
        `${component.name} has been added to your build.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              if (from === 'build') {
                router.back();
              }
            }
          },
          { 
            text: 'Go to Build', 
            onPress: () => {
              router.push('/(tabs)/build');
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Cannot Add',
        'Please select this component from the build screen to add it to your build.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleReplaceInBuild = () => {
    if (slotType) {
      addPart(slotType as any, component);
      Alert.alert(
        'Component Replaced',
        `${component.name} has replaced the current selection.`,
        [{ 
          text: 'OK',
          onPress: () => router.back()
        }]
      );
    }
  };

  const handleSimilarProductPress = (similarComponent: typeof component) => {
    router.push({
      pathname: "/(modals)/component-details",
      params: {
        id: similarComponent.id,
        type: similarComponent.type,
        from: from,
        slotType: slotType
      },
    });
  };

  const SimilarProductCard = ({ item }: { item: typeof component }) => (
    <TouchableOpacity
      style={styles.similarProductCard}
      onPress={() => handleSimilarProductPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.similarProductInner}>
        {/* Stock Badge */}
        <View style={[
          styles.similarStockBadge,
          {
            backgroundColor: item.stock === 'In stock'
              ? THEME.components.badge.success.backgroundColor
              : THEME.components.badge.danger.backgroundColor
          }
        ]}>
          <View style={[
            styles.similarStockDot,
            {
              backgroundColor: item.stock === 'In stock'
                ? THEME.components.badge.success.textColor
                : THEME.components.badge.danger.textColor
            }
          ]} />
          <Text style={[
            styles.similarStockText,
            {
              color: item.stock === 'In stock'
                ? THEME.components.badge.success.textColor
                : THEME.components.badge.danger.textColor
            }
          ]}>
            {item.stock === 'In stock' ? 'In Stock' : 'Out of Stock'}
          </Text>
        </View>

        {/* Product Image */}
        <View style={styles.similarImageContainer}>
          {item.image ? (
            <Image 
              source={{ uri: item.image }} 
              style={styles.similarProductImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.similarImagePlaceholder}>
              <Ionicons name="hardware-chip-outline" size={24} color={COLORS.text.tertiary} />
            </View>
          )}
        </View>

        {/* Product Name */}
        <Text style={styles.similarProductName} numberOfLines={2}>
          {item.name}
        </Text>

        {/* Price */}
        <Text style={styles.similarProductPrice}>
          ₱{item.price.toLocaleString()}
        </Text>

        {/* Quick Spec */}
        <Text style={styles.similarProductSpec} numberOfLines={1}>
          {Object.entries(item.specs)[0]?.[1] || 'High Performance'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={THEME.colors.gradients.dark}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          
          <Text style={styles.title} numberOfLines={1}>
            {component.name}
          </Text>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Component Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            {component.image ? (
              <Image 
                source={{ uri: component.image }} 
                style={styles.componentImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons 
                  name="hardware-chip-outline" 
                  size={64} 
                  color={COLORS.text.tertiary} 
                />
              </View>
            )}
          </View>
        </View>

        {/* Component Info */}
        <View style={styles.infoSection}>
          <View style={styles.priceStockRow}>
            <Text style={styles.price}>
              ₱{component.price.toLocaleString()}
            </Text>
            <View style={[
              styles.stockBadge,
              { 
                backgroundColor: component.stock === 'In stock' 
                  ? THEME.components.badge.success.backgroundColor
                  : THEME.components.badge.danger.backgroundColor,
                borderColor: component.stock === 'In stock'
                  ? THEME.components.badge.success.borderColor
                  : THEME.components.badge.danger.borderColor
              }
            ]}>
              <View style={[
                styles.stockDot,
                { 
                  backgroundColor: component.stock === 'In stock' 
                    ? THEME.components.badge.success.textColor
                    : THEME.components.badge.danger.textColor
                }
              ]} />
              <Text style={[
                styles.stockText,
                { 
                  color: component.stock === 'In stock' 
                    ? THEME.components.badge.success.textColor
                    : THEME.components.badge.danger.textColor
                }
              ]}>
                {component.stock}
              </Text>
            </View>
          </View>

          <Text style={styles.componentType}>
            {component.type.toUpperCase()}
          </Text>

          <Text style={styles.description}>
            High-performance {component.type} for gaming and professional use with excellent specifications and reliability.
          </Text>
        </View>

        {/* Specifications */}
        <View style={styles.specsSection}>
          <View style={styles.specsHeader}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <Text style={styles.specsCount}>
              {Object.keys(component.specs).length} specs
            </Text>
          </View>
          
          {Object.entries(component.specs).map(([key, value]) => (
            <View key={key} style={styles.specRow}>
              <Text style={styles.specKey}>{key}:</Text>
              <Text style={styles.specValue}>{String(value)}</Text>
            </View>
          ))}
        </View>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <View style={styles.similarSection}>
            <View style={styles.similarHeader}>
              <Text style={styles.sectionTitle}>Similar Products</Text>
              <Text style={styles.similarCount}>
                {similarProducts.length} options
              </Text>
            </View>
            
            <FlatList
              data={similarProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.similarProductsList}
              contentContainerStyle={styles.similarProductsContent}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <SimilarProductCard item={item} />}
            />
          </View>
        )}

        {/* Action Buttons */}
        {from !== 'build' && !isInBuild && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAddToBuild}
            >
              <LinearGradient
                colors={THEME.colors.gradients.primary}
                style={styles.buttonGradient}
              >
                <Ionicons name="add-circle" size={20} color="#FFF" />
                <Text style={styles.primaryButtonText}>
                  ADD TO BUILD
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                // Handle compare
              }}
            >
              <View style={styles.secondaryButtonInner}>
                <Ionicons name="git-compare" size={18} color={COLORS.secondary} />
                <Text style={styles.secondaryButtonText}>
                  COMPARE
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* If component is already in build, show status message */}
        {from === 'build' && isInBuild && (
          <View style={styles.inBuildStatus}>
            <View style={[styles.inBuildStatusContainer, { 
              backgroundColor: THEME.components.badge.success.backgroundColor,
              borderColor: THEME.components.badge.success.borderColor
            }]}>
              <View style={styles.inBuildStatusHeader}>
                <Ionicons name="checkmark-circle" size={32} color={THEME.components.badge.success.textColor} />
                <Text style={[styles.inBuildStatusTitle, { color: THEME.components.badge.success.textColor }]}>
                  IN YOUR BUILD
                </Text>
              </View>
              
              <Text style={styles.inBuildStatusText}>
                This component is currently selected in your build
              </Text>
              
              <View style={styles.inBuildActions}>
                <TouchableOpacity
                  style={[styles.backToBuildButton, { 
                    backgroundColor: THEME.components.button.outline.backgroundColor,
                    borderColor: THEME.components.button.outline.borderColor
                  }]}
                  onPress={() => router.back()}
                >
                  <Text style={[styles.backToBuildButtonText, { color: THEME.components.button.outline.textColor }]}>
                    BACK TO BUILD
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.changeComponentButton, {
                    backgroundColor: THEME.components.badge.secondary.backgroundColor,
                    borderColor: THEME.components.badge.secondary.borderColor
                  }]}
                  onPress={() => {
                    router.push({
                      pathname: '/(tabs)/build',
                      params: { 
                        openModal: true,
                        slotType: slotType
                      }
                    });
                  }}
                >
                  <Ionicons name="swap-horizontal" size={14} color={THEME.components.badge.secondary.textColor} />
                  <Text style={[styles.changeComponentButtonText, { color: THEME.components.badge.secondary.textColor }]}>
                    CHANGE
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* If viewing from browse but component is in different slot */}
        {from !== 'build' && isInBuild && (
          <View style={styles.inBuildStatus}>
            <View style={[styles.inBuildStatusContainer, { 
              backgroundColor: THEME.components.badge.info.backgroundColor,
              borderColor: THEME.components.badge.info.borderColor
            }]}>
              <View style={styles.inBuildStatusHeader}>
                <Ionicons name="information-circle" size={32} color={THEME.components.badge.info.textColor} />
                <Text style={[styles.inBuildStatusTitle, { color: THEME.components.badge.info.textColor }]}>
                  ALREADY IN BUILD
                </Text>
              </View>
              
              <Text style={styles.inBuildStatusText}>
                This component is already in your build
              </Text>
              
              <TouchableOpacity
                style={[styles.viewBuildButton, {
                  backgroundColor: THEME.components.button.outline.backgroundColor,
                  borderColor: THEME.components.button.outline.borderColor
                }]}
                onPress={() => router.push('/(tabs)/build')}
              >
                <Text style={[styles.viewBuildButtonText, { color: THEME.components.button.outline.textColor }]}>
                  VIEW BUILD
                </Text>
                <Ionicons name="arrow-forward" size={14} color={THEME.components.button.outline.textColor} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* If viewing from build and can replace */}
        {from === 'build' && !isInBuild && slotType && (
          <View style={styles.replaceSection}>
            <View style={[styles.replaceSectionContainer, { 
              backgroundColor: THEME.components.badge.secondary.backgroundColor,
              borderColor: THEME.components.badge.secondary.borderColor
            }]}>
              <View style={styles.replaceHeader}>
                <Ionicons name="swap-horizontal" size={28} color={THEME.components.badge.secondary.textColor} />
                <Text style={[styles.replaceTitle, { color: THEME.components.badge.secondary.textColor }]}>
                  REPLACE COMPONENT
                </Text>
              </View>
              
              <Text style={styles.replaceText}>
                Replace the current {slotType} in your build with this one
              </Text>
              
              <TouchableOpacity
                style={styles.replaceButton}
                onPress={handleReplaceInBuild}
              >
                <LinearGradient
                  colors={THEME.colors.gradients.secondary}
                  style={styles.replaceButtonGradient}
                >
                  <Ionicons name="refresh" size={18} color="#FFF" />
                  <Text style={styles.replaceButtonText}>REPLACE IN BUILD</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  headerRight: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  imageWrapper: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  componentImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
  },
  infoSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  priceStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: THEME.typography.fontSizes['3xl'],
    fontWeight: THEME.typography.fontWeights.black,
    color: COLORS.primary,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
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
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  componentType: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.text.tertiary,
    fontWeight: THEME.typography.fontWeights.semibold,
    letterSpacing: THEME.typography.letterSpacing.wider,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.text.secondary,
    lineHeight: THEME.typography.lineHeights.relaxed * THEME.typography.fontSizes.md,
  },
  specsSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    margin: SPACING.md,
    marginTop: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  specsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  specsCount: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.text.tertiary,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  specKey: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.tertiary,
    flex: 1,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  specValue: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.primary,
    fontWeight: THEME.typography.fontWeights.semibold,
    textAlign: 'right',
    flex: 1,
    paddingLeft: SPACING.sm,
  },
  // Similar Products Section
  similarSection: {
    marginBottom: SPACING.lg,
  },
  similarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  similarCount: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.text.tertiary,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  similarProductsList: {
    marginHorizontal: -SPACING.lg,
  },
  similarProductsContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  similarProductCard: {
    width: SIMILAR_PRODUCT_WIDTH,
    backgroundColor: THEME.components.card.default.backgroundColor,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  similarProductInner: {
    padding: SPACING.sm,
    height: 200,
    justifyContent: 'space-between',
  },
  similarStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  similarStockDot: {
    width: 5,
    height: 5,
    borderRadius: BORDER_RADIUS.full,
    marginRight: 3,
  },
  similarStockText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  similarImageContainer: {
    width: '100%',
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  similarProductImage: {
    width: '80%',
    height: '80%',
  },
  similarImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  similarProductName: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: COLORS.text.primary,
    lineHeight: THEME.typography.lineHeights.tight * THEME.typography.fontSizes.sm,
    marginBottom: SPACING.xs,
  },
  similarProductPrice: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  similarProductSpec: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.text.tertiary,
    fontWeight: THEME.typography.fontWeights.normal,
  },
  // Action Buttons
  actionButtons: {
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  primaryButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.primary,
  },
  buttonGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonInner: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: THEME.components.button.secondary.backgroundColor,
  },
  secondaryButtonText: {
    color: COLORS.secondary,
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  // In Build Status
  inBuildStatus: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  inBuildStatusContainer: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
  },
  inBuildStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  inBuildStatusTitle: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  inBuildStatusText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: THEME.typography.lineHeights.normal * THEME.typography.fontSizes.sm,
  },
  inBuildActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  backToBuildButton: {
    flex: 2,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  backToBuildButtonText: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  changeComponentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
    borderWidth: 1,
  },
  changeComponentButtonText: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  viewBuildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.sm,
    borderWidth: 1,
  },
  viewBuildButtonText: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  // Replace Section
  replaceSection: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  replaceSectionContainer: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
  },
  replaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  replaceTitle: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  replaceText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: THEME.typography.lineHeights.normal * THEME.typography.fontSizes.sm,
  },
  replaceButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  replaceButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  replaceButtonText: {
    color: COLORS.white,
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  errorText: {
    color: COLORS.text.primary,
    fontSize: THEME.typography.fontSizes.lg,
    textAlign: 'center',
    marginTop: 50,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
});