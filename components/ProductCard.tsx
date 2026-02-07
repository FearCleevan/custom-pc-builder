import { useBuildStore } from '@/store/useBuildStore';
import { useCompareStore } from '@/store/useCompareStore';
import { colors, spacing } from '@/theme';
import { Product } from '@/types/product';
import { Image } from 'expo-image';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const addPart = useBuildStore((state) => state.addPart);
  const addProduct = useCompareStore((state) => state.addProduct);
  const removeProduct = useCompareStore((state) => state.removeProduct);
  const isInCompare = useCompareStore((state) => state.isInCompare(product.id));

  const handleAddToBuild = () => {
    if (product.type === 'cpu' || product.type === 'gpu' || 
        product.type === 'motherboard' || product.type === 'ram' || 
        product.type === 'cooler') {
      addPart(product.type, product);
    }
  };

  const handleCompare = () => {
    if (isInCompare) {
      removeProduct(product.id);
    } else {
      addProduct(product);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image 
        source={{ uri: product.image }} 
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            ${(product.price / 100).toFixed(2)}
          </Text>
          <View style={[
            styles.stockBadge,
            product.stock === 'In stock' ? styles.inStock : styles.lowStock
          ]}>
            <Text style={styles.stockText}>
              {product.stock || 'Unknown'}
            </Text>
          </View>
        </View>

        <View style={styles.storeContainer}>
          <Text style={styles.store}>{product.store}</Text>
          {product.has3D && (
            <View style={styles.badge3D}>
              <Text style={styles.badge3DText}>3D</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddToBuild}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.compareButton,
              isInCompare && styles.compareButtonActive
            ]} 
            onPress={handleCompare}
          >
            <Text style={[
              styles.compareButtonText,
              isInCompare && styles.compareButtonTextActive
            ]}>
              {isInCompare ? 'Remove' : 'Compare'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
    marginRight: spacing.sm,
  },
  stockBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inStock: {
    backgroundColor: colors.success + '20',
  },
  lowStock: {
    backgroundColor: colors.warning + '20',
  },
  stockText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  storeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  store: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  badge3D: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badge3DText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  compareButton: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  compareButtonActive: {
    backgroundColor: colors.error + '20',
    borderColor: colors.error,
  },
  compareButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  compareButtonTextActive: {
    color: colors.error,
  },
});