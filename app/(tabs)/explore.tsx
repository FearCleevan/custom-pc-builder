import {
  allComponents,
  componentCategories,
  ComponentItem,
  getComponentsByType
} from '@/data/mockData';
import { useCompareStore } from '@/store/useCompareStore';
import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Toast Component

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;

// Toast Component
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

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    Array.isArray(params.category) ? params.category[0] : (params.category as string) || 'all'
  );
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState('name');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const addToCompare = useCompareStore((state) => state.addProduct);
  const compareProducts = useCompareStore((state) => state.products);

  // Category-specific filter options
  const getCategoryFilters = () => {
    const baseFilters = [
      { id: 'inStock', label: 'In Stock Only', type: 'checkbox' }
    ];

    switch (selectedCategory) {
      case 'cpu':
        return [
          ...baseFilters,
          { id: 'socket', label: 'Socket', type: 'select', options: ['AM5', 'AM4', 'LGA1700', 'LGA1200'] },
          { id: 'manufacturer', label: 'Brand', type: 'select', options: ['AMD', 'Intel'] },
          { id: 'coreCount', label: 'Cores', type: 'select', options: ['4+', '6+', '8+', '12+', '16+'] }
        ];

      case 'gpu':
        return [
          ...baseFilters,
          { id: 'chipset', label: 'Chipset', type: 'select', options: ['RTX 40 Series', 'RTX 30 Series', 'RX 7000 Series', 'RX 6000 Series'] },
          { id: 'vram', label: 'VRAM', type: 'select', options: ['8GB+', '12GB+', '16GB+', '24GB+'] },
          { id: 'manufacturer', label: 'Brand', type: 'select', options: ['NVIDIA', 'AMD', 'ASUS', 'MSI', 'Gigabyte'] }
        ];

      case 'motherboard':
        return [
          ...baseFilters,
          { id: 'socket', label: 'Socket', type: 'select', options: ['AM5', 'AM4', 'LGA1700'] },
          { id: 'chipset', label: 'Chipset', type: 'select', options: ['X670', 'B650', 'Z790', 'B760'] },
          { id: 'ramType', label: 'RAM Type', type: 'select', options: ['DDR5', 'DDR4'] }
        ];

      case 'ram':
        return [
          ...baseFilters,
          { id: 'ramType', label: 'Type', type: 'select', options: ['DDR5', 'DDR4'] },
          { id: 'capacity', label: 'Capacity', type: 'select', options: ['16GB', '32GB', '64GB', '128GB+'] },
          { id: 'speed', label: 'Speed', type: 'select', options: ['4800+', '5200+', '5600+', '6000+', '6400+'] }
        ];

      case 'storage':
        return [
          ...baseFilters,
          { id: 'type', label: 'Type', type: 'select', options: ['NVMe SSD', 'SATA SSD', 'HDD'] },
          { id: 'capacity', label: 'Capacity', type: 'select', options: ['500GB+', '1TB+', '2TB+', '4TB+'] },
          { id: 'interface', label: 'Interface', type: 'select', options: ['PCIe 4.0', 'PCIe 3.0', 'SATA 6Gb/s'] }
        ];

      case 'psu':
        return [
          ...baseFilters,
          { id: 'wattage', label: 'Wattage', type: 'select', options: ['500W+', '650W+', '750W+', '850W+', '1000W+'] },
          { id: 'rating', label: 'Efficiency', type: 'select', options: ['80+ Bronze', '80+ Gold', '80+ Platinum', '80+ Titanium'] },
          { id: 'modularity', label: 'Modularity', type: 'select', options: ['Non-modular', 'Semi-modular', 'Full modular'] }
        ];

      case 'case':
        return [
          ...baseFilters,
          { id: 'formFactor', label: 'Form Factor', type: 'select', options: ['Mini-ITX', 'Micro-ATX', 'ATX', 'E-ATX'] },
          { id: 'color', label: 'Color', type: 'select', options: ['Black', 'White', 'RGB'] },
          { id: 'sidePanel', label: 'Side Panel', type: 'select', options: ['Tempered Glass', 'Acrylic', 'Solid'] }
        ];

      case 'cooler':
        return [
          ...baseFilters,
          { id: 'type', label: 'Type', type: 'select', options: ['Air Cooler', 'Liquid Cooler'] },
          { id: 'socket', label: 'Socket Support', type: 'select', options: ['AM5', 'AM4', 'LGA1700', 'All'] }
        ];

      default:
        return baseFilters;
    }
  };

  // Get components based on selected category and filters
  const getFilteredComponents = () => {
    let components = selectedCategory === 'all'
      ? allComponents
      : getComponentsByType(selectedCategory);

    // Apply search filter
    if (searchQuery.trim()) {
      components = components.filter(component =>
        component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply stock filter
    if (inStockOnly) {
      components = components.filter(component => component.stock === 'In stock');
    }

    // Apply price filter
    components = components.filter(component =>
      component.price >= priceRange[0] && component.price <= priceRange[1]
    );

    // Apply custom filters based on category
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        components = components.filter(component => {
          const specValue = component.specs[key];
          if (!specValue) return false;

          // Handle different filter types
          if (key === 'capacity' && value.endsWith('+')) {
            const minValue = parseInt(value);
            const compValue = parseInt(String(specValue));
            return compValue >= minValue;
          }

          if (key === 'speed' && value.endsWith('+')) {
            const minSpeed = parseInt(value);
            const compSpeed = parseInt(String(specValue));
            return compSpeed >= minSpeed;
          }

          if (key === 'wattage' && value.endsWith('+')) {
            const minWattage = parseInt(value);
            const compWattage = parseInt(String(specValue));
            return compWattage >= minWattage;
          }

          return String(specValue).includes(value);
        });
      }
    });

    // Apply sorting
    return [...components].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  const filteredComponents = getFilteredComponents();
  const categoryFilters = getCategoryFilters();

  const handleComponentPress = (component: ComponentItem) => {
    router.push({
      pathname: '/product-detail',
      params: {
        id: component.id,
        type: component.type,
      }
    });
  };

  const showToastNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleAddToCompare = (component: ComponentItem) => {
    addToCompare(component);
    showToastNotification(`${component.name} has been added to compare.`, 'success');
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value === prev[filterId] ? null : value
    }));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 100000]);
    setSortBy('name');
    setInStockOnly(false);
    setFilters({});
  };

  // Reset filters when category changes
  useEffect(() => {
    setFilters({});
  }, [selectedCategory]);

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
          <Text style={styles.title}>Browse Components</Text>
          <Text style={styles.subtitle}>
            Explore and compare PC components
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search components..."
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
      </LinearGradient>

      {/* Category Tabs - Always Visible */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionLabel}>CATEGORIES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
          contentContainerStyle={styles.categoryTabsContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryTab,
              selectedCategory === 'all' && styles.categoryTabActive
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[
              styles.categoryTabText,
              selectedCategory === 'all' && styles.categoryTabTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>

          {componentCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.id ? '#FF00FF' : 'rgba(255,255,255,0.7)'}
                style={styles.categoryIcon}
              />
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category.id && styles.categoryTabTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <View style={styles.filterLeft}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={20} color="#FF00FF" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>

          {Object.keys(filters).length > 0 && (
            <View style={styles.activeFiltersBadge}>
              <Text style={styles.activeFiltersText}>
                {Object.keys(filters).length} active
              </Text>
            </View>
          )}
        </View>

        <View style={styles.filterRight}>
          <TouchableOpacity
            style={styles.compareButton}
            onPress={() => {
              if (compareProducts.length > 0) {
                router.push('/compare');
              } else {
                showToastNotification('Add some components to compare first.', 'error');
              }
            }}
          >
            <Ionicons name="git-compare" size={20} color="#00FFFF" />
            {compareProducts.length > 0 && (
              <View style={styles.compareBadge}>
                <Text style={styles.compareBadgeText}>{compareProducts.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              // Simplified sort alert - you might want to create a proper modal for this
              const sortOptions = [
                { text: 'Name (A-Z)', value: 'name' },
                { text: 'Price: Low to High', value: 'price-low' },
                { text: 'Price: High to Low', value: 'price-high' },
              ];
              
              // You can replace this with a custom modal
              setSortBy(prev => {
                const currentIndex = sortOptions.findIndex(opt => opt.value === prev);
                const nextIndex = (currentIndex + 1) % sortOptions.length;
                return sortOptions[nextIndex].value;
              });
            }}
          >
            <Text style={styles.sortButtonText}>
              {sortBy === 'price-low' ? 'Price ↑' :
                sortBy === 'price-high' ? 'Price ↓' : 'Name'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Count */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>
          {filteredComponents.length} {filteredComponents.length === 1 ? 'item' : 'items'} found
        </Text>
        <TouchableOpacity onPress={handleResetFilters}>
          <Text style={styles.resetLink}>Reset All</Text>
        </TouchableOpacity>
      </View>

      {/* Components Grid */}
      <FlatList
        data={filteredComponents}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.componentCard}
            onPress={() => handleComponentPress(item)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
              style={styles.cardGradient}
            >
              {/* Stock Badge */}
              <View style={styles.stockBadge}>
                <View style={[
                  styles.stockDot,
                  { backgroundColor: item.stock === 'In stock' ? '#00FF00' : '#FF0000' }
                ]} />
                <Text style={styles.stockText}>{item.stock}</Text>
              </View>

              {/* Component Image/Icon */}
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageText}>
                  {item.type.charAt(0).toUpperCase()}
                </Text>
              </View>

              {/* Component Type */}
              <Text style={styles.componentType}>
                {item.type.toUpperCase()}
              </Text>

              {/* Component Name */}
              <Text style={styles.componentName} numberOfLines={2}>
                {item.name}
              </Text>

              {/* Quick Specs Preview */}
              <View style={styles.specsPreview}>
                {Object.entries(item.specs)
                  .slice(0, 2)
                  .map(([key, value], index) => (
                    <Text key={index} style={styles.specPreviewText} numberOfLines={1}>
                      {key}: {String(value)}
                    </Text>
                  ))}
              </View>

              {/* Component Price */}
              <Text style={styles.componentPrice}>
                ₱{item.price.toLocaleString()}
              </Text>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.compareIconButton}
                  onPress={() => handleAddToCompare(item)}
                >
                  <Ionicons name="git-compare" size={16} color="#00FFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleComponentPress(item)}
                >
                  <Text style={styles.viewButtonText}>VIEW DETAILS</Text>
                  <Ionicons name="arrow-forward" size={12} color="#00FFFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#666" />
            <Text style={styles.emptyStateText}>
              No components found
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your filters or search
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetFilters}
            >
              <Text style={styles.resetButtonText}>RESET ALL FILTERS</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Advanced Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#0a0a0f', '#1a1a2e']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderLeft}>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Filters</Text>
              </View>
              <TouchableOpacity onPress={handleResetFilters}>
                <Text style={styles.resetAllText}>Reset All</Text>
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.filterContent}>
              {/* Price Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.priceInputs}>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceLabel}>Min:</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={priceRange[0].toString()}
                      onChangeText={(text) => setPriceRange([parseInt(text) || 0, priceRange[1]])}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#666"
                    />
                  </View>
                  <Text style={styles.priceSeparator}>-</Text>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceLabel}>Max:</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={priceRange[1].toString()}
                      onChangeText={(text) => setPriceRange([priceRange[0], parseInt(text) || 100000])}
                      keyboardType="numeric"
                      placeholder="100000"
                      placeholderTextColor="#666"
                    />
                  </View>
                </View>
              </View>

              {/* Stock Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Availability</Text>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setInStockOnly(!inStockOnly)}
                >
                  <View style={[
                    styles.checkbox,
                    inStockOnly && styles.checkboxChecked
                  ]}>
                    {inStockOnly && (
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>In Stock Only</Text>
                </TouchableOpacity>
              </View>

              {/* Category-specific Filters */}
              {selectedCategory !== 'all' && categoryFilters.length > 1 && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>
                    {selectedCategory.toUpperCase()} Filters
                  </Text>
                  {categoryFilters
                    .filter(filter => filter.id !== 'inStock')
                    .map(filter => (
                      <View key={filter.id} style={styles.filterGroup}>
                        <Text style={styles.filterGroupLabel}>{filter.label}</Text>
                        <View style={styles.filterOptions}>
                          {filter.options?.map(option => (
                            <TouchableOpacity
                              key={option}
                              style={[
                                styles.filterOption,
                                filters[filter.id] === option && styles.filterOptionActive
                              ]}
                              onPress={() => handleFilterChange(filter.id, option)}
                            >
                              <Text style={[
                                styles.filterOptionText,
                                filters[filter.id] === option && styles.filterOptionTextActive
                              ]}>
                                {option}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <LinearGradient
                  colors={['#FF00FF', '#9400D3']}
                  style={styles.applyButtonGradient}
                >
                  <Text style={styles.applyButtonText}>APPLY FILTERS</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
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
    paddingTop: 60,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
    textShadowColor: 'rgba(255, 0, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    marginLeft: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categorySection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sectionLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  categoryTabs: {
    flexGrow: 0,
  },
  categoryTabsContent: {
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: spacing.sm,
  },
  categoryTabActive: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderColor: '#FF00FF',
  },
  categoryIcon: {
    marginRight: spacing.xs,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  categoryTabTextActive: {
    color: '#FF00FF',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  filterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterButtonText: {
    color: '#FF00FF',
    fontSize: 14,
    fontWeight: '600',
  },
  activeFiltersBadge: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeFiltersText: {
    fontSize: 10,
    color: '#FF00FF',
    fontWeight: '600',
  },
  filterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  compareButton: {
    position: 'relative',
    padding: spacing.xs,
  },
  compareBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#00FFFF',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBadgeText: {
    fontSize: 10,
    color: '#0a0a0f',
    fontWeight: '900',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sortButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  resultsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  resetLink: {
    fontSize: 14,
    color: '#FF00FF',
    fontWeight: '600',
  },
  grid: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  componentCard: {
    width: CARD_WIDTH,
    marginRight: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: spacing.md,
    height: 280,
    justifyContent: 'space-between',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  stockText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  imagePlaceholder: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  imageText: {
    fontSize: 32,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
  },
  componentType: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  componentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    lineHeight: 18,
    marginBottom: spacing.sm,
    flex: 1,
  },
  specsPreview: {
    marginBottom: spacing.sm,
    gap: 2,
  },
  specPreviewText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  componentPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF00FF',
    marginBottom: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compareIconButton: {
    padding: spacing.xs,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  viewButtonText: {
    fontSize: 10,
    color: '#00FFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
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
    marginBottom: spacing.lg,
  },
  resetButton: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.3)',
  },
  resetButtonText: {
    color: '#FF00FF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0a0a0f',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  resetAllText: {
    color: '#FF00FF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterContent: {
    padding: spacing.lg,
  },
  filterSection: {
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: spacing.lg,
    letterSpacing: 1,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  priceInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    minWidth: 40,
  },
  priceInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: spacing.sm,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  priceSeparator: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FF00FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: '#FF00FF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#FFF',
  },
  filterGroup: {
    marginBottom: spacing.lg,
  },
  filterGroupLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterOptionActive: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderColor: '#FF00FF',
  },
  filterOptionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  filterOptionTextActive: {
    color: '#FF00FF',
  },
  modalActions: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  applyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});