import { spacing } from '@/theme';
import { Product, ProductType } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  onViewDetails?: () => void;
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

const typeIcons: Record<ProductType, string> = {
  cpu: 'hardware-chip-outline',
  gpu: 'game-controller-outline',
  motherboard: 'grid-outline',
  ram: 'albums-outline',
  cooler: 'snow-outline',
  storage: 'save-outline',
  psu: 'flash-outline',
  case: 'cube-outline',
};

export const BuildSlot: React.FC<BuildSlotProps> = ({
  type,
  product,
  onAddPress,
  onRemovePress,
  onViewDetails,
}) => {
  return (
    <View style={styles.container}>
      {product ? (
        <View style={styles.productContainer}>
          <View style={styles.productLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name={typeIcons[type] as any} size={24} color="#FF00FF" />
              {product && <View style={styles.iconGlow} />}
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              <Text style={styles.productPrice}>
                ₱{product.price.toLocaleString()}
              </Text>
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
          </View>
          
          <View style={styles.actionButtons}>
            {onViewDetails && (
              <TouchableOpacity 
                style={styles.viewButton}
                onPress={onViewDetails}
              >
                <Ionicons name="eye-outline" size={20} color="#00FFFF" />
              </TouchableOpacity>
            )}
            
            {onRemovePress && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={onRemovePress}
              >
                <Ionicons name="trash-outline" size={20} color="#FF0000" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.emptySlot} 
          onPress={onAddPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
            style={styles.emptySlotGradient}
          >
            <View style={styles.emptyIconContainer}>
              <Ionicons name={typeIcons[type] as any} size={32} color="#666" />
              <Ionicons name="add-circle" size={16} color="#00FFFF" style={styles.addIcon} />
            </View>
            <Text style={styles.emptySlotText}>Add {typeLabels[type]}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  productContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  iconContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    backgroundColor: '#FF00FF',
    opacity: 0.2,
    borderRadius: 17,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF00FF',
    marginBottom: spacing.sm,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewButton: {
    padding: spacing.sm,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  removeButton: {
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  emptySlot: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptySlotGradient: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  addIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#0a0a0f',
    borderRadius: 10,
  },
  emptySlotText: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
});