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
  currentComponent: Product | null;
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
  currentComponent,
}) => {
  const [components, setComponents] = useState<Product[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState<'low' | 'high' | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Product | null>(currentComponent);

  useEffect(() => {
    if (slotType) {
      const componentsList = getComponentsByType(slotType);
      setComponents(componentsList);
      setFilteredComponents(componentsList);
      setSelectedComponent(currentComponent);
    }
  }, [slotType, currentComponent]);

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
    setSelectedComponent(component);
    onSelect(component);
  };

  const handleRemove = () => {
    setSelectedComponent(null);
    // Pass null to indicate removal
    onSelect(null as any);
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
            {selectedComponent ? 'Currently selected' : 'Choose a'} {typeLabels[slotType].toLowerCase()} for your build
          </Text>

          {/* Current Selection Display */}
          {selectedComponent && (
            <View style={styles.currentSelection}>
              <LinearGradient
                colors={['rgba(255, 0, 255, 0.1)', 'rgba(148, 0, 211, 0.05)']}
                style={styles.currentSelectionGradient}
              >
                <View style={styles.currentSelectionHeader}>
                  <Text style={styles.currentSelectionTitle}>CURRENTLY SELECTED</Text>
                  <TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
                    <Ionicons name="trash-outline" size={20} color="#FF0000" />
                    <Text style={styles.removeButtonText}>REMOVE</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.currentSelectionContent}>
                  <View style={styles.selectionImagePlaceholder}>
                    <Text style={styles.selectionImageText}>
                      {slotType.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  
                  <View style={styles.selectionInfo}>
                    <Text style={styles.selectionName} numberOfLines={2}>
                      {selectedComponent.name}
                    </Text>
                    <Text style={styles.selectionPrice}>
                      ₱{selectedComponent.price.toLocaleString()}
                    </Text>
                    <View style={[
                      styles.selectionStockBadge,
                      { backgroundColor: selectedComponent.stock === 'In stock' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)' }
                    ]}>
                      <View style={[
                        styles.selectionStockDot,
                        { backgroundColor: selectedComponent.stock === 'In stock' ? '#00FF00' : '#FF0000' }
                      ]} />
                      <Text style={[
                        styles.selectionStockText,
                        { color: selectedComponent.stock === 'In stock' ? '#00FF00' : '#FF0000' }
                      ]}>
                        {selectedComponent.stock}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}
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

        {/* Available Components List */}
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderTitle}>
            AVAILABLE {typeLabels[slotType].toUpperCase()}S
          </Text>
          <Text style={styles.listHeaderCount}>
            {filteredComponents.length} options
          </Text>
        </View>

        <FlatList
          data={filteredComponents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selectedComponent?.id === item.id;
            
            return (
              <TouchableOpacity
                style={[
                  styles.componentCard,
                  isSelected && styles.componentCardSelected
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isSelected 
                    ? ['rgba(255, 0, 255, 0.15)', 'rgba(148, 0, 211, 0.1)']
                    : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                  }
                  style={styles.cardGradient}
                >
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color="#FF00FF" />
                      <Text style={styles.selectedIndicatorText}>SELECTED</Text>
                    </View>
                  )}

                  {/* Card Header */}
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
                    
                    {isSelected ? (
                      <TouchableOpacity
                        style={styles.replaceButton}
                        onPress={() => handleSelect(item)}
                      >
                        <Text style={styles.replaceButtonText}>REPLACE</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.selectButtonSmall}
                        onPress={() => handleSelect(item)}
                      >
                        <Text style={styles.selectButtonSmallText}>SELECT</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Component Image/Icon */}
                  <View style={styles.componentImagePlaceholder}>
                    <Text style={styles.componentImageText}>
                      {slotType.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  {/* Component Name */}
                  <Text style={[
                    styles.componentName,
                    isSelected && styles.componentNameSelected
                  ]} numberOfLines={2}>
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

                  {/* Price and Action Button */}
                  <View style={styles.cardFooter}>
                    <Text style={[
                      styles.componentPrice,
                      isSelected && styles.componentPriceSelected
                    ]}>
                      ₱{item.price.toLocaleString()}
                    </Text>
                    
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        isSelected ? styles.replaceButtonLarge : styles.selectButtonLarge
                      ]}
                      onPress={() => handleSelect(item)}
                    >
                      <LinearGradient
                        colors={isSelected ? ['#FF0000', '#8B0000'] : ['#FF00FF', '#9400D3']}
                        style={styles.actionButtonGradient}
                      >
                        <Text style={styles.actionButtonText}>
                          {isSelected ? 'REPLACE' : 'SELECT'}
                        </Text>
                        <Ionicons 
                          name={isSelected ? "swap-horizontal" : "checkmark"} 
                          size={16} 
                          color="#FFF" 
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          }}
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

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={onClose}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.doneButtonGradient}
            >
              <Text style={styles.doneButtonText}>DONE</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    height: SCREEN_HEIGHT * 0.9,
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
    marginBottom: spacing.md,
  },
  currentSelection: {
    marginTop: spacing.md,
  },
  currentSelectionGradient: {
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.2)',
  },
  currentSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  currentSelectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF00FF',
    letterSpacing: 2,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: spacing.xs,
  },
  removeButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF0000',
    letterSpacing: 1,
  },
  currentSelectionContent: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  selectionImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionImageText: {
    fontSize: 24,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
  },
  selectionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  selectionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  selectionPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF00FF',
    marginBottom: spacing.xs,
  },
  selectionStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  selectionStockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  selectionStockText: {
    fontSize: 12,
    fontWeight: '600',
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
  listHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  listHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00FFFF',
    letterSpacing: 2,
  },
  listHeaderCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
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
  componentCardSelected: {
    borderWidth: 2,
    borderColor: '#FF00FF',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  cardGradient: {
    padding: spacing.lg,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: spacing.xs,
  },
  selectedIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF00FF',
    letterSpacing: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  selectButtonSmall: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  selectButtonSmallText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00FFFF',
    letterSpacing: 1,
  },
  replaceButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  replaceButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF0000',
    letterSpacing: 1,
  },
  componentImagePlaceholder: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  componentImageText: {
    fontSize: 32,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
  },
  componentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  componentNameSelected: {
    color: '#FF00FF',
    fontWeight: '700',
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
  componentPriceSelected: {
    color: '#FF00FF',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectButtonLarge: {
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  replaceButtonLarge: {
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionButtonText: {
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
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
  },
  doneButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  doneButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});