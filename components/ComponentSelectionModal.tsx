// components/ComponentSelectionModal.tsx
import { getComponentsByType } from '@/data/mockData';
import { spacing } from '@/theme';
import { Product, ProductType } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ComponentSelectionModalProps {
  slotType: ProductType | null;
  onSelect: (component: Product) => void;
  onClose: () => void;
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

export const ComponentSelectionModal: React.FC<ComponentSelectionModalProps> = ({
  slotType,
  onSelect,
  onClose,
}) => {
  const [components, setComponents] = useState<Product[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState<'low' | 'high' | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    if (slotType) {
      const componentsList = getComponentsByType(slotType);
      setComponents(componentsList);
      setFilteredComponents(componentsList);
    }
  }, [slotType]);

  useEffect(() => {
    let filtered = [...components];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(component =>
        component.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply stock filter
    if (inStockOnly) {
      filtered = filtered.filter(component => component.stock === 'In stock');
    }

    // Apply price sorting
    if (priceSort === 'low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'high') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredComponents(filtered);
  }, [searchQuery, priceSort, inStockOnly, components]);

  const handleSelect = (component: Product) => {
    onSelect(component);
  };

  if (!slotType) {
    return null;
  }

  return (
    <View style={styles.modalOverlay}>
      <LinearGradient
        colors={['#0a0a0f', '#1a1a2e']}
        style={styles.modalContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Select {typeLabels[slotType]}</Text>
            <View style={styles.headerRight} />
          </View>
          
          <Text style={styles.subtitle}>
            Choose a {typeLabels[slotType].toLowerCase()} for your build
          </Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${typeLabels[slotType]}...`}
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Filter Row */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterButton, priceSort === 'low' && styles.filterButtonActive]}
              onPress={() => setPriceSort(priceSort === 'low' ? null : 'low')}
            >
              <Text style={[styles.filterButtonText, priceSort === 'low' && styles.filterButtonTextActive]}>
                Price ↑
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, priceSort === 'high' && styles.filterButtonActive]}
              onPress={() => setPriceSort(priceSort === 'high' ? null : 'high')}
            >
              <Text style={[styles.filterButtonText, priceSort === 'high' && styles.filterButtonTextActive]}>
                Price ↓
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, inStockOnly && styles.filterButtonActive]}
              onPress={() => setInStockOnly(!inStockOnly)}
            >
              <Ionicons 
                name={inStockOnly ? "checkbox" : "square-outline"} 
                size={16} 
                color={inStockOnly ? '#00FFFF' : '#666'} 
              />
              <Text style={[styles.filterButtonText, inStockOnly && styles.filterButtonTextActive]}>
                In Stock
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                setSearchQuery('');
                setPriceSort(null);
                setInStockOnly(false);
              }}
            >
              <Text style={styles.filterButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Components List */}
        <FlatList
          data={filteredComponents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.componentCard}
              onPress={() => handleSelect(item)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.cardGradient}
              >
                {/* Stock Badge */}
                <View style={styles.cardHeader}>
                  <View style={[
                    styles.stockBadge,
                    { backgroundColor: item.stock === 'In stock' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)' }
                  ]}>
                    <View style={[
                      styles.stockDot,
                      { backgroundColor: item.stock === 'In stock' ? '#00FF00' : '#FF0000' }
                    ]} />
                    <Text style={[
                      styles.stockText,
                      { color: item.stock === 'In stock' ? '#00FF00' : '#FF0000' }
                    ]}>
                      {item.stock}
                    </Text>
                  </View>
                </View>

                {/* Component Name */}
                <Text style={styles.componentName} numberOfLines={2}>
                  {item.name}
                </Text>

                {/* Component Specs Preview */}
                <View style={styles.specsPreview}>
                  {Object.entries(item.specs)
                    .slice(0, 2)
                    .map(([key, value]) => (
                      <Text key={key} style={styles.specText} numberOfLines={1}>
                        <Text style={styles.specKey}>{key}: </Text>
                        <Text style={styles.specValue}>{String(value)}</Text>
                      </Text>
                    ))}
                </View>

                {/* Price and Select Button */}
                <View style={styles.cardFooter}>
                  <Text style={styles.componentPrice}>
                    ₱{item.price.toLocaleString()}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => handleSelect(item)}
                  >
                    <LinearGradient
                      colors={['#FF00FF', '#9400D3']}
                      style={styles.selectButtonGradient}
                    >
                      <Text style={styles.selectButtonText}>SELECT</Text>
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#666" />
              <Text style={styles.emptyStateText}>
                No {typeLabels[slotType].toLowerCase()}s found
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  headerRight: {
    width: 40,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  filtersContainer: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    marginLeft: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderColor: '#FF00FF',
  },
  filterButtonText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FF00FF',
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  componentCard: {
    marginBottom: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
  componentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  specsPreview: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  specText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  specKey: {
    fontWeight: '600',
  },
  specValue: {
    fontWeight: '400',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  componentPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF00FF',
  },
  selectButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  selectButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});