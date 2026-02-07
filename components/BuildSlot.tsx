import { colors, spacing } from '@/theme';
import { Product, ProductType } from '@/types/product';
import { Image } from 'expo-image';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface BuildSlotProps {
  type: ProductType;
  product: Product | null;
  onAddPress?: () => void;
  onRemovePress?: () => void;
}

const typeLabels: Record<ProductType, string> = {
  cpu: 'CPU',
  gpu: 'GPU',
  motherboard: 'Motherboard',
  ram: 'RAM',
  cooler: 'CPU Cooler',
  storage: 'Storage',
  psu: 'Power Supply',
  case: 'Case',
};

export const BuildSlot: React.FC<BuildSlotProps> = ({
  type,
  product,
  onAddPress,
  onRemovePress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.typeLabel}>{typeLabels[type]}</Text>
      
      {product ? (
        <View style={styles.productContainer}>
          <Image 
            source={{ uri: product.image }} 
            style={styles.productImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.productPrice}>
              ${(product.price / 100).toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.removeButton} 
            onPress={onRemovePress}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Text style={styles.addButtonText}>+ Add {typeLabels[type]}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  addButton: {
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: spacing.lg,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  productContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
  },
  removeButton: {
    padding: spacing.sm,
  },
  removeButtonText: {
    fontSize: 20,
    color: colors.error,
    fontWeight: 'bold',
  },
});