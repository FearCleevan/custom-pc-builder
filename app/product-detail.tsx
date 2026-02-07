import { SpecTable } from '@/components/SpecTable';
import { allComponents, getComponentsByType } from '@/data/mockData';
import { useBuildStore } from '@/store/useBuildStore';
import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Dimensions,
  LinearGradient,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProductDetailModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    id: string; 
    type: string;
    from?: string;
  }>();
  
  const addPart = useBuildStore((state) => state.addPart);

  // Find the product using the new mockData structure
  const product = allComponents.find(p => p.id === params.id) || 
                  getComponentsByType(params.type).find(p => p.id === params.id);

  if (!product) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={true}
        onRequestClose={() => router.back()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#0a0a0f', '#1a1a2e']}
              style={styles.gradientBackground}
            >
              <Text style={styles.errorText}>Product not found</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => router.back()}
              >
                <LinearGradient
                  colors={['#FF00FF', '#9400D3']}
                  style={styles.closeButtonGradient}
                >
                  <Text style={styles.closeButtonText}>CLOSE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    );
  }

  const handleAddToBuild = () => {
    // Check if this is a valid component type for building
    const buildComponentTypes = ['cpu', 'gpu', 'motherboard', 'ram', 'cooler', 'storage', 'psu', 'case'];
    
    if (buildComponentTypes.includes(product.type)) {
      addPart(product);
      Alert.alert(
        'Added to Build',
        `${product.name} has been added to your build.`,
        [
          { 
            text: 'Continue Browsing',
            style: 'cancel'
          },
          { 
            text: 'View Build', 
            style: 'default',
            onPress: () => {
              router.back(); // Close modal first
              router.push('/(tabs)/build');
            }
          },
        ]
      );
    } else {
      Alert.alert(
        'Cannot Add to Build',
        'This component type cannot be added to a PC build.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleAddToCompare = () => {
    // This would integrate with your compare store
    Alert.alert(
      'Compare Feature',
      'This feature will be available soon.',
      [{ text: 'OK' }]
    );
  };

  const handleView3D = () => {
    if (product.has3D) {
      Alert.alert(
        '3D Model',
        '3D model viewer will be available soon.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        '3D Model Not Available',
        'This product does not have a 3D model.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => router.back()}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <LinearGradient
            colors={['#0a0a0f', '#1a1a2e']}
            style={styles.headerGradient}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              
              <Text style={styles.modalTitle} numberOfLines={1}>
                {product.type.toUpperCase()}
              </Text>
              
              <View style={styles.headerRight} />
            </View>
          </LinearGradient>

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Product Image */}
            <View style={styles.imageContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.imagePlaceholder}
              >
                <Text style={styles.imageText}>
                  {product.type.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            </View>

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
                    { color: product.stock === 'In stock' ? '#00FF00' : '#FF0000' }
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
                <SpecTable specs={product.specs} />
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <LinearGradient
            colors={['rgba(10, 10, 15, 0.8)', 'rgba(10, 10, 15, 1)']}
            style={styles.footerGradient}
          >
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.back()}
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
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0a0a0f',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '90%',
  },
  gradientBackground: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGradient: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  backButton: {
    padding: spacing.sm,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  imagePlaceholder: {
    width: width * 0.7,
    height: width * 0.7,
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
    marginBottom: spacing.xxl,
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
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  closeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '80%',
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
  footerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
});