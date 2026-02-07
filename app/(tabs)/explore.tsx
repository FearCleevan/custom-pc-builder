import { CompareModal } from '@/components/CompareModal';
import { FilterBar } from '@/components/FilterBar';
import { ProductCard } from '@/components/ProductCard';
import { cpuCoolerData } from '@/data/cooler';
import { cpuData } from '@/data/cpu';
import { gpuData } from '@/data/gpu';
import { motherboardData } from '@/data/motherboard';
import { ramData } from '@/data/ram';
import { FilterOptions, filterProducts } from '@/logic/filtering';
import { useCompareStore } from '@/store/useCompareStore';
import { colors, spacing } from '@/theme';
import { Product } from '@/types/product';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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

const TYPE_LABELS: Record<string, string> = {
  cpu: 'Processors (CPU)',
  gpu: 'Graphics Cards (GPU)',
  motherboard: 'Motherboards',
  ram: 'Memory (RAM)',
  cooler: 'CPU Coolers',
  all: 'All Products',
};

export default function ExploreScreen() {
  const params = useLocalSearchParams<{ type?: string; preSelectedId?: string }>();
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(params.type || 'all');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showCompareModal, setShowCompareModal] = useState(false);
  const compareProducts = useCompareStore((state) => state.products);
  const clearProducts = useCompareStore((state) => state.clearProducts);

  // Get products based on selected type
  const getProducts = () => {
    if (selectedType === 'all') {
      return Object.values(PRODUCT_DATA).flat();
    }
    return PRODUCT_DATA[selectedType] || [];
  };

  const products = getProducts();
  const filteredProducts = filterProducts(products, filters);

  const productTypes = [
    { id: 'all', label: 'All' },
    { id: 'cpu', label: 'CPU' },
    { id: 'gpu', label: 'GPU' },
    { id: 'motherboard', label: 'MB' },
    { id: 'ram', label: 'RAM' },
    { id: 'cooler', label: 'Cooler' },
  ];

  useEffect(() => {
    if (params.preSelectedId) {
      // Scroll to pre-selected product (in a real app, you'd implement scroll logic)
      console.log('Pre-selected product ID:', params.preSelectedId);
    }
  }, [params.preSelectedId]);

  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/product-detail',
      params: { id: product.id, type: product.type },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{TYPE_LABELS[selectedType]}</Text>
        {compareProducts.length > 0 && (
          <TouchableOpacity 
            style={styles.compareBadge}
            onPress={() => setShowCompareModal(true)}
          >
            <Text style={styles.compareBadgeText}>
              Compare ({compareProducts.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FilterBar 
        onFilterChange={setFilters}
        productType={selectedType !== 'all' ? selectedType : undefined}
      />

      {/* Product Type Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.typeTabsContainer}
        contentContainerStyle={styles.typeTabsContent}
      >
        {productTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeTab,
              selectedType === type.id && styles.typeTabActive,
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <Text style={[
              styles.typeTabText,
              selectedType === type.id && styles.typeTabTextActive,
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products List */}
      <ScrollView 
        style={styles.productsContainer}
        contentContainerStyle={styles.productsContent}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No products found matching your criteria.
            </Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => setFilters({})}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => handleProductPress(product)}
            />
          ))
        )}
      </ScrollView>

      <CompareModal
        visible={showCompareModal}
        onClose={() => setShowCompareModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  compareBadge: {
    backgroundColor: colors.textLight + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  compareBadgeText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  typeTabsContainer: {
    backgroundColor: colors.background,
  },
  typeTabsContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  typeTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeTabText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  typeTabTextActive: {
    color: colors.textLight,
  },
  productsContainer: {
    flex: 1,
  },
  productsContent: {
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  resetButtonText: {
    color: colors.textLight,
    fontWeight: '600',
  },
});