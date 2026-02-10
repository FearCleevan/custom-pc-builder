// ProductDetailModal.tsx
import { THEME } from '@/theme/indexs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { allComponents, ComponentItem } from '@/data/mockData';
import { useBuildStore } from '@/store/useBuildStore';
import { useCompareStore } from '@/store/useCompareStore';
import { ProductType } from '@/types/product';

const { colors: COLORS, spacing: SPACING, borderRadius: BORDER_RADIUS, shadows: SHADOWS } = THEME;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 3) / 2;

interface ProductDetailModalProps {
  visible: boolean;
  product: ComponentItem | null;
  onClose: () => void;
  onProductChange?: (product: ComponentItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  visible,
  product,
  onClose,
  onProductChange,
}) => {
  const addPart = useBuildStore((state) => state.addPart);
  const addToCompare = useCompareStore((state) => state.addProduct);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Get similar products (same type, different products)
  const getSimilarProducts = () => {
    if (!product) return [];
    
    const similarProducts = allComponents
      .filter(p => p.type === product.type && p.id !== product.id)
      .slice(0, 5);
    
    return similarProducts;
  };

  const similarProducts = getSimilarProducts();

  const showToastNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleAddToBuild = () => {
    if (!product) return;

    // Map your product types to the expected ProductType
    const typeMap: Record<string, ProductType> = {
      'cpu': 'cpu',
      'gpu': 'gpu',
      'motherboard': 'motherboard',
      'ram': 'ram',
      'cooler': 'cooler',
      'storage': 'storage',
      'psu': 'psu',
      'case': 'case',
      'fan': 'cooler',
      'monitor': 'monitor',
      'keyboard': 'keyboard',
      'mouse': 'mouse',
    };

    const buildType = typeMap[product.type];
    
    if (buildType) {
      addPart(buildType, product);
      showToastNotification(`${product.name} has been added to your build.`, 'success');
    } else {
      showToastNotification('This component type cannot be added to a PC build.', 'error');
    }
  };

  const handleAddToCompare = () => {
    if (!product) return;
    
    addToCompare(product);
    showToastNotification(`${product.name} has been added to compare.`, 'success');
  };

  const handleSimilarProductPress = (similarProduct: ComponentItem) => {
    if (onProductChange) {
      onProductChange(similarProduct);
    }
  };

  const handleBackPress = () => {
    onClose();
  };

  if (!product) {
    return null;
  }

  // Toast Component
  const ToastNotification = () => {
    if (!showToast) return null;

    return (
      <View style={[
        styles.toastContainer,
        toastType === 'success' ? styles.toastSuccess : styles.toastError
      ]}>
        <Ionicons 
          name={toastType === 'success' ? "checkmark-circle" : "alert-circle"} 
          size={20} 
          color={COLORS.white} 
        />
        <Text style={styles.toastText}>{toastMessage}</Text>
      </View>
    );
  };

  // Product Card Component for Similar Products
  const ProductCard = ({ 
    product: similarProduct, 
    onPress 
  }: { 
    product: ComponentItem, 
    onPress: (product: ComponentItem) => void 
  }) => {
    const hasImage = similarProduct.image && similarProduct.image.length > 0;
    const isInStock = similarProduct.stock === 'In stock';
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => onPress(similarProduct)}
        activeOpacity={0.8}
      >
        <View style={styles.productCardContainer}>
          {/* Stock Badge */}
          <View style={[
            styles.productCardStockBadge,
            {
              backgroundColor: isInStock
                ? THEME.components.badge.success.backgroundColor
                : THEME.components.badge.danger.backgroundColor
            }
          ]}>
            <View style={[
              styles.productCardStockDot,
              {
                backgroundColor: isInStock
                  ? THEME.components.badge.success.textColor
                  : THEME.components.badge.danger.textColor
              }
            ]} />
            <Text style={[
              styles.productCardStockText,
              {
                color: isInStock
                  ? THEME.components.badge.success.textColor
                  : THEME.components.badge.danger.textColor
              }
            ]}>
              {similarProduct.stock}
            </Text>
          </View>

          {/* Product Image */}
          <View style={styles.productCardImageContainer}>
            {hasImage ? (
              <Image 
                source={{ uri: similarProduct.image }} 
                style={styles.productCardImage}
                resizeMode="contain"
                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              />
            ) : (
              <View style={styles.productCardImagePlaceholder}>
                <Text style={styles.productCardImageText}>
                  {similarProduct.type.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Product Name */}
          <Text style={styles.productCardName} numberOfLines={2}>
            {similarProduct.name}
          </Text>

          {/* Quick Specs Preview */}
          <View style={styles.productCardSpecs}>
            {Object.entries(similarProduct.specs)
              .slice(0, 2)
              .map(([key, value], index) => (
                <Text key={index} style={styles.productCardSpecText} numberOfLines={1}>
                  {key}: {String(value)}
                </Text>
              ))}
          </View>

          {/* Product Price */}
          <Text style={styles.productCardPrice}>
            ₱{similarProduct.price.toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Main Product Image Component
  const ProductMainImage = () => {
    const hasImage = product.image && product.image.length > 0;
    
    return (
      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image 
            source={{ uri: product.image }} 
            style={styles.productMainImage}
            resizeMode="contain"
            onError={(e) => console.log('Main image load error:', e.nativeEvent.error)}
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
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Toast Notification */}
          <ToastNotification />

          {/* Header */}
          <LinearGradient
            colors={THEME.colors.gradients.dark}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBackPress}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle} numberOfLines={1}>
                {product.type.toUpperCase()}
              </Text>
              
              <TouchableOpacity 
                style={[styles.headerCompareButton, { 
                  backgroundColor: THEME.components.badge.secondary.backgroundColor,
                  borderColor: THEME.components.badge.secondary.borderColor
                }]}
                onPress={handleAddToCompare}
              >
                <Ionicons name="git-compare" size={20} color={THEME.components.badge.secondary.textColor} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Product Image */}
            <ProductMainImage />

            {/* Product Info */}
            <View style={styles.infoSection}>
              <Text style={styles.productName}>{product.name}</Text>
              
              <View style={styles.priceStockRow}>
                <Text style={styles.price}>₱{product.price.toLocaleString()}</Text>
                <View style={[
                  styles.stockBadge,
                  { 
                    backgroundColor: product.stock === 'In stock'
                      ? THEME.components.badge.success.backgroundColor
                      : THEME.components.badge.danger.backgroundColor,
                    borderColor: product.stock === 'In stock'
                      ? THEME.components.badge.success.borderColor
                      : THEME.components.badge.danger.borderColor
                  }
                ]}>
                  <View style={[
                    styles.stockDot,
                    { 
                      backgroundColor: product.stock === 'In stock'
                        ? THEME.components.badge.success.textColor
                        : THEME.components.badge.danger.textColor
                    }
                  ]} />
                  <Text style={[
                    styles.stockText,
                    { 
                      color: product.stock === 'In stock'
                        ? THEME.components.badge.success.textColor
                        : THEME.components.badge.danger.textColor
                    }
                  ]}>
                    {product.stock}
                  </Text>
                </View>
              </View>

              {product.store && (
                <View style={styles.storeRow}>
                  <Ionicons name="storefront" size={16} color={COLORS.text.tertiary} />
                  <Text style={styles.storeText}>{product.store}</Text>
                </View>
              )}
            </View>

            {/* Specifications */}
            <View style={styles.specsSection}>
              <Text style={styles.sectionTitle}>SPECIFICATIONS</Text>
              <View style={styles.specsContainer}>
                {Object.entries(product.specs).map(([key, value], index) => (
                  <View 
                    key={key} 
                    style={[
                      styles.specRow,
                      index % 2 === 0 && styles.specRowAlt
                    ]}
                  >
                    <Text style={styles.specKey}>{key}</Text>
                    <Text style={styles.specValue}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
              <View style={styles.similarProductsSection}>
                <View style={styles.similarProductsHeader}>
                  <Text style={styles.sectionTitle}>SIMILAR PRODUCTS</Text>
                  <TouchableOpacity 
                    style={styles.viewAllButton}
                    onPress={onClose}
                  >
                    <Text style={styles.viewAllText}>VIEW ALL</Text>
                    <Ionicons name="arrow-forward" size={12} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                
                <FlatList
                  data={similarProducts}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.similarProductsList}
                  renderItem={({ item }) => (
                    <ProductCard 
                      product={item}
                      onPress={handleSimilarProductPress}
                    />
                  )}
                />
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footerContainer}>
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleBackPress}
              >
                <View style={[
                  styles.secondaryButtonInner,
                  {
                    backgroundColor: THEME.components.button.secondary.backgroundColor,
                    borderColor: THEME.components.button.secondary.borderColor
                  }
                ]}>
                  <Ionicons name="arrow-back" size={20} color={THEME.components.button.secondary.textColor} />
                  <Text style={[
                    styles.secondaryButtonText,
                    { color: THEME.components.button.secondary.textColor }
                  ]}>BACK</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleAddToBuild}
              >
                <LinearGradient
                  colors={THEME.colors.gradients.primary}
                  style={styles.primaryButtonGradient}
                >
                  <Ionicons name="add-circle" size={24} color={COLORS.white} />
                  <Text style={styles.primaryButtonText}>ADD TO BUILD</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 40,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  toastContainer: {
    position: 'absolute',
    top: 100,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  toastSuccess: {
    backgroundColor: THEME.components.badge.success.backgroundColor,
    borderWidth: 1,
    borderColor: THEME.components.badge.success.borderColor,
  },
  toastError: {
    backgroundColor: THEME.components.badge.danger.backgroundColor,
    borderWidth: 1,
    borderColor: THEME.components.badge.danger.borderColor,
  },
  toastText: {
    color: COLORS.white,
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    flex: 1,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    letterSpacing: THEME.typography.letterSpacing.wide,
    flex: 1,
    textAlign: 'center',
  },
  headerCompareButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  scrollContent: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    height: SCREEN_WIDTH * 0.7,
    justifyContent: 'center',
  },
  productMainImage: {
    width: '100%',
    height: '100%',
    maxWidth: SCREEN_WIDTH * 0.7,
    maxHeight: SCREEN_WIDTH * 0.7,
    borderRadius: BORDER_RADIUS.xl,
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  productName: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    lineHeight: THEME.typography.lineHeights.tight * THEME.typography.fontSizes['2xl'],
  },
  priceStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  price: {
    fontSize: THEME.typography.fontSizes['3xl'],
    fontWeight: THEME.typography.fontWeights.black,
    color: COLORS.primary,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  stockText: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  storeText: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.text.secondary,
    fontWeight: THEME.typography.fontWeights.normal,
  },
  specsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  specsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  specRowAlt: {
    backgroundColor: COLORS.surfaceLight,
  },
  specKey: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.text.secondary,
    flex: 1,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  specValue: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.text.primary,
    fontWeight: THEME.typography.fontWeights.semibold,
    flex: 1,
    textAlign: 'right',
  },
  footerContainer: {
    paddingTop: SPACING.md,
    backgroundColor: COLORS.background,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  primaryButton: {
    flex: 2,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.primary,
  },
  primaryButtonGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
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
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonInner: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  secondaryButtonText: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  similarProductsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  similarProductsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  viewAllText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.primary,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  similarProductsList: {
    gap: SPACING.md,
    paddingRight: SPACING.lg,
  },
  productCard: {
    width: CARD_WIDTH,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: THEME.components.card.default.backgroundColor,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  productCardContainer: {
    padding: SPACING.sm,
    height: 200,
    justifyContent: 'space-between',
  },
  productCardStockBadge: {
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
  productCardStockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 3,
  },
  productCardStockText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  productCardImageContainer: {
    width: '100%',
    height: 50,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productCardImage: {
    width: '100%',
    height: '100%',
  },
  productCardImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCardImageText: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.black,
    color: COLORS.text.tertiary,
  },
  productCardName: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: COLORS.text.primary,
    lineHeight: THEME.typography.lineHeights.tight * THEME.typography.fontSizes.sm,
    marginBottom: SPACING.xs,
    flex: 1,
  },
  productCardSpecs: {
    marginBottom: SPACING.xs,
    gap: 1,
  },
  productCardSpecText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.text.tertiary,
    fontWeight: THEME.typography.fontWeights.normal,
  },
  productCardPrice: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.primary,
  },
});