// ProductDetailModal.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { allComponents } from '@/data/mockData';
import { useBuildStore } from '@/store/useBuildStore';
import { useCompareStore } from '@/store/useCompareStore';
import { spacing } from '@/theme';
import { ComponentItem } from '@/types/component';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;

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

    const buildComponentTypes = ['cpu', 'gpu', 'motherboard', 'ram', 'cooler', 'storage', 'psu', 'case'];
    
    if (buildComponentTypes.includes(product.type)) {
      addPart(product);
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

  const handleView3D = () => {
    if (product?.has3D) {
      Alert.alert(
        '3D Model',
        '3D model viewer will be available soon.',
        [{ text: 'OK' }]
      );
    } else {
      showToastNotification('This product does not have a 3D model.', 'error');
    }
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
          color="#FFF" 
        />
        <Text style={styles.toastText}>{toastMessage}</Text>
      </View>
    );
  };

  // Product Card Component for Similar Products
  const ProductCard = ({ 
    product, 
    onPress 
  }: { 
    product: ComponentItem, 
    onPress: (product: ComponentItem) => void 
  }) => {
    // Check if product has image property
    const hasImage = product.image && product.image.length > 0;
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => onPress(product)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
          style={styles.productCardGradient}
        >
          {/* Stock Badge */}
          <View style={styles.productCardStockBadge}>
            <View style={[
              styles.productCardStockDot,
              { backgroundColor: product.stock === 'In stock' ? '#00FF00' : '#FF0000' }
            ]} />
            <Text style={styles.productCardStockText}>{product.stock}</Text>
          </View>

          {/* Product Image */}
          <View style={styles.productCardImageContainer}>
            {hasImage ? (
              <Image 
                source={{ uri: product.image }} 
                style={styles.productCardImage}
                resizeMode="contain"
                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              />
            ) : (
              <View style={styles.productCardImagePlaceholder}>
                <Text style={styles.productCardImageText}>
                  {product.type.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Product Name */}
          <Text style={styles.productCardName} numberOfLines={2}>
            {product.name}
          </Text>

          {/* Quick Specs Preview */}
          <View style={styles.productCardSpecs}>
            {Object.entries(product.specs)
              .slice(0, 2)
              .map(([key, value], index) => (
                <Text key={index} style={styles.productCardSpecText} numberOfLines={1}>
                  {key}: {String(value)}
                </Text>
              ))}
          </View>

          {/* Product Price */}
          <Text style={styles.productCardPrice}>
            ₱{product.price.toLocaleString()}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Main Product Image Component
  const ProductMainImage = () => {
    // Check if main product has image property
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
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.imagePlaceholder}
          >
            <Text style={styles.imageText}>
              {product.type.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
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
            colors={['#000000', '#1a1a2e']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBackPress}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle} numberOfLines={1}>
                {product.type.toUpperCase()}
              </Text>
              
              <TouchableOpacity 
                style={styles.headerCompareButton}
                onPress={handleAddToCompare}
              >
                <Ionicons name="git-compare" size={20} color="#00FFFF" />
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
                  { backgroundColor: product.stock === 'In stock' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)' }
                ]}>
                  <View style={[
                    styles.stockDot,
                    { backgroundColor: product.stock === 'In stock' ? '#00FF00' : '#FF0000' }
                  ]} />
                  <Text style={[
                    styles.stockText,
                    { color: product.stock === 'In stock' ? '#00FFFF' : '#FF4444' }
                  ]}>
                    {product.stock}
                  </Text>
                </View>
              </View>

              {product.store && (
                <View style={styles.storeRow}>
                  <Ionicons name="storefront" size={16} color="#666" />
                  <Text style={styles.storeText}>{product.store}</Text>
                </View>
              )}

              {/* Action Buttons Row */}
              <View style={styles.actionButtonsRow}>
                {product.has3D && (
                  <TouchableOpacity 
                    style={styles.view3DButton}
                    onPress={handleView3D}
                  >
                    <Ionicons name="cube" size={16} color="#00FFFF" />
                    <Text style={styles.view3DButtonText}>3D VIEW</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.compareButton}
                  onPress={handleAddToCompare}
                >
                  <Ionicons name="git-compare" size={16} color="#00FFFF" />
                  <Text style={styles.compareButtonText}>COMPARE</Text>
                </TouchableOpacity>
              </View>
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
                    <Ionicons name="arrow-forward" size={12} color="#FF00FF" />
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
          <LinearGradient
            colors={['rgba(10, 10, 15, 0.8)', 'rgba(10, 10, 15, 1)']}
            style={styles.footerGradient}
          >
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleBackPress}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.secondaryButtonGradient}
                >
                  <Ionicons name="arrow-back" size={20} color="#FFF" />
                  <Text style={styles.secondaryButtonText}>BACK</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleAddToBuild}
              >
                <LinearGradient
                  colors={['#FF00FF', '#9400D3']}
                  style={styles.primaryButtonGradient}
                >
                  <Ionicons name="add-circle" size={24} color="#FFF" />
                  <Text style={styles.primaryButtonText}>ADD TO BUILD</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
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
  toastContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toastSuccess: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
  },
  toastError: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  toastText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
    flex: 1,
    textAlign: 'center',
  },
  headerCompareButton: {
    padding: spacing.sm,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 8,
  },
  scrollContent: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    height: SCREEN_WIDTH * 0.7,
    justifyContent: 'center',
  },
  productMainImage: {
    width: '100%',
    height: '100%',
    maxWidth: SCREEN_WIDTH * 0.7,
    maxHeight: SCREEN_WIDTH * 0.7,
    borderRadius: 20,
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    fontSize: 64,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
  },
  infoSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  priceStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  price: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF00FF',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  storeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  view3DButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  view3DButtonText: {
    fontSize: 12,
    color: '#00FFFF',
    fontWeight: '600',
    letterSpacing: 1,
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  compareButtonText: {
    fontSize: 12,
    color: '#00FFFF',
    fontWeight: '600',
    letterSpacing: 1,
  },
  specsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: spacing.lg,
    letterSpacing: 2,
  },
  specsContainer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  specRowAlt: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  specKey: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  footerGradient: {
    paddingTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  primaryButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
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
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  similarProductsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  similarProductsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewAllText: {
    fontSize: 12,
    color: '#FF00FF',
    fontWeight: '600',
  },
  similarProductsList: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  productCard: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  productCardGradient: {
    padding: spacing.sm,
    height: 200,
    justifyContent: 'space-between',
  },
  productCardStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  productCardStockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 3,
  },
  productCardStockText: {
    fontSize: 8,
    color: '#FFF',
    fontWeight: '600',
  },
  productCardImageContainer: {
    width: '100%',
    height: 50,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    overflow: 'hidden',
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
    fontSize: 20,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
  },
  productCardName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    lineHeight: 14,
    marginBottom: spacing.xs,
    flex: 1,
  },
  productCardSpecs: {
    marginBottom: spacing.xs,
    gap: 1,
  },
  productCardSpecText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
  },
  productCardPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF00FF',
  },
});