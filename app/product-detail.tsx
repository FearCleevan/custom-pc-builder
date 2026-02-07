import { SpecTable } from '@/components/SpecTable';
import { cpuCoolerData } from '@/data/cooler';
import { cpuData } from '@/data/cpu';
import { gpuData } from '@/data/gpu';
import { motherboardData } from '@/data/motherboard';
import { ramData } from '@/data/ram';
import { useBuildStore } from '@/store/useBuildStore';
import { colors, spacing } from '@/theme';
import { Product } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
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

const PRODUCT_DATA: Record<string, Product[]> = {
  cpu: cpuData,
  gpu: gpuData,
  motherboard: motherboardData,
  ram: ramData,
  cooler: cpuCoolerData,
};

export default function ProductDetailModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; type: string }>();
  const addPart = useBuildStore((state) => state.addPart);

  const product = PRODUCT_DATA[params.type]?.find(p => p.id === params.id);

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
            <Text style={styles.errorText}>Product not found</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  const handleAddToBuild = () => {
    if (product.type === 'cpu' || product.type === 'gpu' || 
        product.type === 'motherboard' || product.type === 'ram' || 
        product.type === 'cooler') {
      addPart(product.type, product);
      Alert.alert(
        'Added to Build',
        `${product.name} has been added to your build.`,
        [
          { text: 'Continue Shopping' },
          { 
            text: 'View Build', 
            onPress: () => router.push('/(tabs)/build')
          },
        ]
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
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeIcon}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {product.name}
            </Text>
          </View>

          <ScrollView style={styles.scrollContent}>
            <Image 
              source={{ uri: product.image }} 
              style={styles.productImage}
              contentFit="cover"
              transition={200}
            />
            
            <View style={styles.priceSection}>
              <Text style={styles.price}>${(product.price / 100).toFixed(2)}</Text>
              <View style={[
                styles.stockBadge,
                product.stock === 'In stock' ? styles.inStock : styles.lowStock
              ]}>
                <Text style={styles.stockText}>{product.stock}</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Store:</Text>
                <Text style={styles.infoValue}>{product.store}</Text>
              </View>
              {product.has3D && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>3D Model:</Text>
                  <Text style={styles.infoValue}>Available</Text>
                </View>
              )}
            </View>

            <View style={styles.specsSection}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              <SpecTable specs={product.specs} />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddToBuild}
            >
              <Text style={styles.addButtonText}>Add to Build</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeIcon: {
    marginRight: spacing.md,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.success,
  },
  stockBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  inStock: {
    backgroundColor: colors.success + '20',
  },
  lowStock: {
    backgroundColor: colors.warning + '20',
  },
  stockText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  specsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});