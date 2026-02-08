import { allComponents, getComponentsByType } from '@/data/mockData';
import { useBuildStore } from '@/store/useBuildStore';
import { useCompareStore } from '@/store/useCompareStore';
import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Toast Component for this screen
const ToastNotification = ({ visible, message, type }: { visible: boolean, message: string, type: 'success' | 'error' }) => {
  if (!visible) return null;

  return (
    <View style={[
      styles.toastContainer,
      type === 'success' ? styles.toastSuccess : styles.toastError
    ]}>
      <Ionicons 
        name={type === 'success' ? "checkmark-circle" : "alert-circle"} 
        size={20} 
        color="#FFF" 
      />
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    id: string; 
    type: string;
  }>();
  
  const addPart = useBuildStore((state) => state.addPart);
  const addToCompare = useCompareStore((state) => state.addProduct);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Find the product
  const product = allComponents.find(p => p.id === params.id) || 
                  getComponentsByType(params.type).find(p => p.id === params.id);

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

  if (!product) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0a0f', '#1a1a2e']}
          style={styles.gradientBackground}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.errorContent}>
            <Ionicons name="alert-circle" size={64} color="#FF0000" />
            <Text style={styles.errorText}>Product not found</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <LinearGradient
                colors={['#FF00FF', '#9400D3']}
                style={styles.closeButtonGradient}
              >
                <Text style={styles.closeButtonText}>GO BACK</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      <ToastNotification 
        visible={showToast} 
        message={toastMessage} 
        type={toastType} 
      />

      {/* Header */}
      <LinearGradient
        colors={['#000000', '#1a1a2e']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle} numberOfLines={1}>
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
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
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
  gradientBackground: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
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
  headerRight: {
    width: 40,
  },
  errorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    textAlign: 'center',
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