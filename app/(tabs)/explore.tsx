import {
  allComponents,
  componentCategories,
  ComponentItem,
  getComponentsByType
} from '@/data/mockData';
import { useCompareStore } from '@/store/useCompareStore';
import { THEME } from '@/theme/indexs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Import the new modal components
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { ToastNotification } from '@/components/ToastNotification';

const { colors: COLORS, spacing: SPACING, borderRadius: BORDER_RADIUS, shadows: SHADOWS } = THEME;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 3) / 2;
const HEADER_EXPANDED_HEIGHT = 130;
const HEADER_COLLAPSED_HEIGHT = 80;

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
  const [selectedProduct, setSelectedProduct] = useState<ComponentItem | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const addToCompare = useCompareStore((state) => state.addProduct);
  const compareProducts = useCompareStore((state) => state.products);

  // Handle scroll animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 100],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  // Helper function to extract numeric value from spec string
  const extractNumericValue = (specValue: string | number | boolean): number => {
    if (typeof specValue === 'number') return specValue;
    if (typeof specValue === 'boolean') return specValue ? 1 : 0;

    const str = String(specValue).trim();

    // Remove any non-numeric characters except digits
    const numericStr = str.replace(/[^\d]/g, '');

    return numericStr ? parseInt(numericStr, 10) : 0;
  };

  // Helper function to extract RAM speed
  const extractRamSpeed = (speedValue: string | number | boolean): number => {
    if (typeof speedValue === 'number') return speedValue;

    const str = String(speedValue);

    // Try different patterns for RAM speed
    const patterns = [
      /(\d+)\s*MHz/i,          // "6000 MHz"
      /(\d+)\s*MT\/s/i,        // "6000 MT/s"
      /DDR\d+\s*(\d+)/i,       // "DDR5 6000"
      /(\d+)$/                 // Just numbers at the end
    ];

    for (const pattern of patterns) {
      const match = str.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    // Fallback to general numeric extraction
    return extractNumericValue(str);
  };

  // Helper function to get GPU series from chipset
  const getGPUSeries = (chipset: string): string => {
    const chipsetStr = String(chipset).toUpperCase();

    if (chipsetStr.includes('RTX 4090') || chipsetStr.includes('RTX 4080') || chipsetStr.includes('RTX 4070')) {
      return 'RTX 40 Series';
    }
    if (chipsetStr.includes('RTX 3080') || chipsetStr.includes('RTX 3070') || chipsetStr.includes('RTX 3060')) {
      return 'RTX 30 Series';
    }
    if (chipsetStr.includes('RTX 2080') || chipsetStr.includes('RTX 2070') || chipsetStr.includes('RTX 2060')) {
      return 'RTX 20 Series';
    }
    if (chipsetStr.includes('RX 7900') || chipsetStr.includes('RX 7800') || chipsetStr.includes('RX 7700')) {
      return 'RX 7000 Series';
    }
    if (chipsetStr.includes('RX 6800') || chipsetStr.includes('RX 6700') || chipsetStr.includes('RX 6600')) {
      return 'RX 6000 Series';
    }
    if (chipsetStr.includes('RX 5700') || chipsetStr.includes('RX 5600')) {
      return 'RX 5000 Series';
    }

    return 'Unknown Series';
  };

  // Category-specific filter options
  const getCategoryFilters = () => {
    const baseFilters = [
      { id: 'inStock', label: 'In Stock Only', type: 'checkbox' }
    ];

    switch (selectedCategory) {
      case 'cpu':
        return [
          ...baseFilters,
          { id: 'Socket', label: 'Socket', type: 'select', options: ['AM5', 'AM4', 'LGA1700', 'LGA1200'] },
          { id: 'Manufacturer', label: 'Brand', type: 'select', options: ['AMD', 'Intel'] },
          { id: 'Core Count', label: 'Cores', type: 'select', options: ['4+', '6+', '8+', '12+', '16+'] }
        ];

      case 'gpu':
        return [
          ...baseFilters,
          {
            id: 'Series',
            label: 'Series',
            type: 'select',
            options: [
              'RTX 40 Series',
              'RTX 30 Series',
              'RTX 20 Series',
              'RX 7000 Series',
              'RX 6000 Series',
              'RX 5000 Series'
            ]
          },
          {
            id: 'VRAM',
            label: 'VRAM',
            type: 'select',
            options: [
              '4GB+',
              '6GB+',
              '8GB+',
              '10GB+',
              '12GB+',
              '16GB+',
              '24GB+'
            ]
          },
          {
            id: 'Manufacturer',
            label: 'Brand',
            type: 'select',
            options: [
              'NVIDIA',
              'AMD',
              'ASUS',
              'MSI',
              'Gigabyte'
            ]
          }
        ];

      case 'motherboard':
        return [
          ...baseFilters,
          { id: 'Socket', label: 'Socket', type: 'select', options: ['AM5', 'AM4', 'LGA1700'] },
          { id: 'Chipset', label: 'Chipset', type: 'select', options: ['X670', 'B650', 'Z790', 'B760'] },
          { id: 'RAM Type', label: 'RAM Type', type: 'select', options: ['DDR5', 'DDR4'] }
        ];

      case 'ram':
        return [
          ...baseFilters,
          {
            id: 'RAM Type',
            label: 'Type',
            type: 'select',
            options: ['DDR5', 'DDR4']
          },
          {
            id: 'Total Capacity',
            label: 'Total Capacity',
            type: 'select',
            options: [
              '16GB+',
              '32GB+',
              '64GB+',
              '128GB+'
            ]
          },
          {
            id: 'Speed',
            label: 'Speed',
            type: 'select',
            options: [
              '4800+',
              '5200+',
              '5600+',
              '6000+',
              '6400+',
              '3200+',
              '3600+',
              '4000+'
            ]
          },
          {
            id: 'Manufacturer',
            label: 'Brand',
            type: 'select',
            options: [
              'Corsair',
              'G.Skill',
              'Kingston',
              'TeamGroup',
              'Crucial'
            ]
          }
        ];

      case 'storage':
        return [
          ...baseFilters,
          { id: 'Type', label: 'Type', type: 'select', options: ['NVMe SSD', 'SATA SSD', 'HDD'] },
          { id: 'Capacity', label: 'Capacity', type: 'select', options: ['500GB+', '1TB+', '2TB+', '4TB+'] },
          { id: 'Interface', label: 'Interface', type: 'select', options: ['PCIe 4.0', 'PCIe 3.0', 'SATA 6Gb/s'] }
        ];

      case 'psu':
        return [
          ...baseFilters,
          { id: 'Wattage', label: 'Wattage', type: 'select', options: ['500W+', '650W+', '750W+', '850W+', '1000W+'] },
          { id: 'Rating', label: 'Efficiency', type: 'select', options: ['80+ Bronze', '80+ Gold', '80+ Platinum', '80+ Titanium'] },
          { id: 'Modularity', label: 'Modularity', type: 'select', options: ['Non-modular', 'Semi-modular', 'Full modular'] }
        ];

      case 'case':
        return [
          ...baseFilters,
          { id: 'Form Factor', label: 'Form Factor', type: 'select', options: ['Mini-ITX', 'Micro-ATX', 'ATX', 'E-ATX'] },
          { id: 'Color', label: 'Color', type: 'select', options: ['Black', 'White', 'RGB'] },
          { id: 'Side Panel', label: 'Side Panel', type: 'select', options: ['Tempered Glass', 'Acrylic', 'Solid'] }
        ];

      case 'cooler':
        return [
          ...baseFilters,
          { id: 'Type', label: 'Type', type: 'select', options: ['Air Cooler', 'Liquid Cooler'] },
          { id: 'Socket Support', label: 'Socket Support', type: 'select', options: ['AM5', 'AM4', 'LGA1700', 'All'] }
        ];

      case 'fan':
        return [
          ...baseFilters,
          { id: 'Size', label: 'Fan Size', type: 'select', options: ['120mm', '140mm', '200mm'] },
          { id: 'RGB', label: 'RGB', type: 'select', options: ['Yes', 'No'] }
        ];

      case 'monitor':
        return [
          ...baseFilters,
          { id: 'Size', label: 'Screen Size', type: 'select', options: ['24"', '27"', '32"', '34"+'] },
          { id: 'Resolution', label: 'Resolution', type: 'select', options: ['1080p', '1440p', '4K'] },
          { id: 'Refresh Rate', label: 'Refresh Rate', type: 'select', options: ['144Hz+', '165Hz+', '240Hz+'] }
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
      const query = searchQuery.toLowerCase().trim();
      components = components.filter(component => {
        // Search in name, type, and category
        if (
          component.name.toLowerCase().includes(query) ||
          component.type.toLowerCase().includes(query) ||
          (component.category && component.category.toLowerCase().includes(query))
        ) {
          return true;
        }

        // Search in all specs
        return Object.values(component.specs).some(value =>
          String(value).toLowerCase().includes(query)
        );
      });
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
      if (value && components.length > 0) {
        components = components.filter(component => {
          // Handle special "+" filters for ranges
          if (typeof value === 'string' && value.endsWith('+')) {
            const minValue = extractNumericValue(value);

            // CPU Core Count
            if (key === 'Core Count') {
              const coreCount = extractNumericValue(component.specs['Core Count'] || 0);
              return coreCount >= minValue;
            }

            // GPU VRAM
            if (key === 'VRAM') {
              const vramValue = component.specs['VRAM'] || component.specs['Memory Size'];
              const vram = extractNumericValue(vramValue);
              return vram >= minValue;
            }

            // RAM Capacity
            if (key === 'Total Capacity') {
              const capacityValue = component.specs['Total Capacity'];
              const capacity = extractNumericValue(capacityValue);
              return capacity >= minValue;
            }

            // RAM Speed
            if (key === 'Speed' && (component.type === 'ram' || selectedCategory === 'ram')) {
              const speedValue = component.specs['Speed'];
              const speed = extractRamSpeed(speedValue);
              return speed >= minValue;
            }

            // Storage Capacity
            if (key === 'Capacity') {
              const capacityValue = component.specs['Capacity'] || component.specs['Size'];
              const capacity = extractNumericValue(capacityValue);
              return capacity >= minValue;
            }

            // PSU Wattage
            if (key === 'Wattage') {
              const wattageValue = component.specs['Wattage'];
              const wattage = extractNumericValue(wattageValue);
              return wattage >= minValue;
            }

            // Monitor Refresh Rate
            if (key === 'Refresh Rate') {
              const refreshValue = component.specs['Refresh Rate'];
              const refresh = extractNumericValue(refreshValue);
              return refresh >= minValue;
            }

            // Monitor Size
            if (key === 'Size' && (component.type === 'monitor' || selectedCategory === 'monitor')) {
              const sizeValue = component.specs['Size'];
              const size = extractNumericValue(sizeValue);
              return size >= minValue;
            }
          }

          // Handle GPU Series filter
          if (key === 'Series' && (component.type === 'gpu' || selectedCategory === 'gpu')) {
            let seriesValue = component.specs['Series'];

            // Convert to string if it's not already
            const seriesStr = typeof seriesValue === 'string' ? seriesValue : String(seriesValue);

            // If Series is not in specs, derive it from Chipset
            if (!seriesStr || seriesStr === 'undefined' || seriesStr === 'null') {
              const chipsetValue = component.specs['Chipset'];
              if (chipsetValue) {
                // Convert chipset to string as well
                const chipsetStr = typeof chipsetValue === 'string' ? chipsetValue : String(chipsetValue);
                seriesValue = getGPUSeries(chipsetStr);
              } else {
                seriesValue = '';
              }
            } else {
              seriesValue = seriesStr;
            }

            return seriesValue === value;
          }

          // Handle exact string matches
          const specValue = component.specs[key];
          if (specValue === undefined) return false;

          // String comparison (case-insensitive for some fields)
          if (typeof specValue === 'string') {
            const specStr = specValue.toLowerCase();
            const filterStr = String(value).toLowerCase();

            // For fields like Manufacturer, Socket, etc., do exact or partial match
            if (['Manufacturer', 'Socket', 'RAM Type', 'Type', 'Interface',
              'Rating', 'Modularity', 'Form Factor', 'Color', 'Side Panel',
              'Resolution', 'Size', 'RGB'].includes(key)) {
              return specStr === filterStr || specStr.includes(filterStr) || filterStr.includes(specStr);
            }

            return specStr === filterStr;
          }

          // For numeric/boolean values
          return String(specValue) === String(value);
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
    setSelectedProduct(component);
    setShowProductDetail(true);
  };

  const showToastNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

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

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Reset filters when category changes
  useEffect(() => {
    setFilters({});
    setSearchQuery('');
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      <ToastNotification
        visible={showToast}
        message={toastMessage}
        type={toastType}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={showProductDetail}
        product={selectedProduct}
        onClose={() => setShowProductDetail(false)}
        onProductChange={(product) => setSelectedProduct(product)}
      />

      {/* Animated Header */}
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <LinearGradient
          colors={THEME.colors.gradients.dark}
          style={styles.headerGradient}
        >
          {/* Compact Header (shown when scrolled) */}
          <Animated.View
            style={[
              styles.compactHeader,
              {
                opacity: scrollY.interpolate({
                  inputRange: [80, 100],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 50,
                paddingTop: 10,
              }
            ]}
          >
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons name="filter" size={22} color={COLORS.primary} />
            </TouchableOpacity>

            <Animated.View style={{
              transform: [
                { scale: titleScale },
                { translateY: titleTranslateY }
              ]
            }}>
              <Text style={styles.compactTitle}>
                {selectedCategory === 'all' ? 'Browse' : selectedCategory.toUpperCase()}
              </Text>
            </Animated.View>

            <View style={styles.compactHeaderRight}>
              <TouchableOpacity
                style={styles.compactSearchButton}
                onPress={() => {
                  flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                }}
              >
                <Ionicons name="search" size={20} color={COLORS.secondary} />
              </TouchableOpacity>

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
                <Ionicons name="git-compare" size={20} color={COLORS.secondary} />
                {compareProducts.length > 0 && (
                  <View style={[styles.compareBadge, { backgroundColor: COLORS.secondary }]}>
                    <Text style={styles.compareBadgeText}>{compareProducts.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Expanded Header Content */}
          <Animated.View
            style={[
              styles.expandedHeader,
              {
                opacity: headerOpacity,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: HEADER_EXPANDED_HEIGHT,
              }
            ]}
          >
            {/* Title and Subtitle */}
            <View style={styles.headerContent}>
              <Text style={styles.title}>Browse Components</Text>
              <Text style={styles.subtitle}>
                {selectedCategory === 'all'
                  ? 'Explore and compare PC components'
                  : `Browse ${selectedCategory.toUpperCase()} components`}
              </Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color={COLORS.text.tertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${selectedCategory === 'all' ? 'components' : selectedCategory}...`}
                placeholderTextColor={COLORS.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.text.tertiary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </Animated.View>

          {/* Category Tabs */}
          <View style={[
            styles.categorySection,
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'transparent',
            }
          ]}>
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
                    size={14}
                    color={selectedCategory === category.id ? COLORS.primary : COLORS.text.tertiary}
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
        </LinearGradient>
      </Animated.View>

      {/* Filter Bar */}
      <Animated.View
        style={[
          styles.filterBar,
          {
            opacity: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [0, -20],
                extrapolate: 'clamp',
              })
            }]
          }
        ]}
      >
        <View style={styles.filterLeft}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={18} color={COLORS.primary} />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>

          {Object.keys(filters).filter(key => filters[key] !== null).length > 0 && (
            <View style={[styles.activeFiltersBadge, { backgroundColor: THEME.components.badge.primary.backgroundColor }]}>
              <Text style={[styles.activeFiltersText, { color: THEME.components.badge.primary.textColor }]}>
                {Object.keys(filters).filter(key => filters[key] !== null).length}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.filterRight}>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              const sortOptions = [
                { text: 'Name (A-Z)', value: 'name' },
                { text: 'Price: Low to High', value: 'price-low' },
                { text: 'Price: High to Low', value: 'price-high' },
              ];

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
            <Ionicons name="chevron-down" size={14} color={COLORS.text.tertiary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Results Count */}
      <Animated.View
        style={[
          styles.resultsBar,
          {
            opacity: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            })
          }
        ]}
      >
        <Text style={styles.resultsText}>
          {filteredComponents.length} {filteredComponents.length === 1 ? 'item' : 'items'} found
        </Text>
        <TouchableOpacity onPress={handleResetFilters}>
          <Text style={styles.resetLink}>Reset All</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Scroll To Top Button */}
      <Animated.View
        style={[
          styles.scrollToTopButton,
          {
            opacity: scrollY.interpolate({
              inputRange: [100, 200],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [100, 200],
                outputRange: [20, 0],
                extrapolate: 'clamp',
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.scrollToTopTouchable}
          onPress={scrollToTop}
        >
          <LinearGradient
            colors={THEME.colors.gradients.primary}
            style={styles.scrollToTopGradient}
          >
            <Ionicons name="arrow-up" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Components Grid */}
      <FlatList
        ref={flatListRef}
        data={filteredComponents}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        onScroll={
          Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )
        }
        scrollEventThrottle={16}
        ListHeaderComponent={
          filteredComponents.length > 0 ? (
            <Text style={styles.gridTitle}>
              {selectedCategory === 'all'
                ? 'All Components'
                : `${selectedCategory.toUpperCase()} (${filteredComponents.length})`}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.componentCard}
            onPress={() => handleComponentPress(item)}
            activeOpacity={0.8}
          >
            <View style={styles.cardContainer}>
              {/* Stock Badge */}
              <View style={[
                styles.stockBadge,
                {
                  backgroundColor: item.stock === 'In stock'
                    ? THEME.components.badge.success.backgroundColor
                    : THEME.components.badge.danger.backgroundColor
                }
              ]}>
                <View style={[
                  styles.stockDot,
                  {
                    backgroundColor: item.stock === 'In stock'
                      ? THEME.components.badge.success.textColor
                      : THEME.components.badge.danger.textColor
                  }
                ]} />
                <Text style={[
                  styles.stockText,
                  {
                    color: item.stock === 'In stock'
                      ? THEME.components.badge.success.textColor
                      : THEME.components.badge.danger.textColor
                  }
                ]}>
                  {item.stock}
                </Text>
              </View>

              {/* Component Image */}
              <View style={styles.imageContainer}>
                {'image' in item && item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.componentImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="hardware-chip-outline" size={32} color="rgba(255,255,255,0.2)" />
                  </View>
                )}
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
                  style={[
                    styles.compareIconButton,
                    {
                      backgroundColor: compareProducts.some(p => p.id === item.id)
                        ? COLORS.text.disabled + '20'
                        : THEME.components.badge.secondary.backgroundColor,
                      borderColor: compareProducts.some(p => p.id === item.id)
                        ? COLORS.text.disabled + '30'
                        : THEME.components.badge.secondary.borderColor
                    }
                  ]}
                  onPress={() => handleAddToCompare(item)}
                  disabled={compareProducts.some(p => p.id === item.id)}
                >
                  <Ionicons
                    name="git-compare"
                    size={14}
                    color={compareProducts.some(p => p.id === item.id) ? COLORS.text.disabled : THEME.components.badge.secondary.textColor}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.viewButton,
                    {
                      backgroundColor: THEME.components.button.outline.backgroundColor,
                      borderColor: THEME.components.button.outline.borderColor
                    }
                  ]}
                  onPress={() => handleComponentPress(item)}
                >
                  <Text style={[
                    styles.viewButtonText,
                    { color: THEME.components.button.outline.textColor }
                  ]}>VIEW</Text>
                  <Ionicons name="arrow-forward" size={10} color={THEME.components.button.outline.textColor} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={COLORS.text.tertiary} />
            <Text style={styles.emptyStateText}>
              No components found
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your filters or search
            </Text>
            <TouchableOpacity
              style={[styles.resetButton, { 
                backgroundColor: THEME.components.button.outline.backgroundColor,
                borderColor: THEME.components.button.outline.borderColor
              }]}
              onPress={handleResetFilters}
            >
              <Text style={[styles.resetButtonText, { color: THEME.components.button.outline.textColor }]}>
                RESET ALL FILTERS
              </Text>
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
              colors={THEME.colors.gradients.dark}
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
                      onChangeText={(text) => {
                        const value = parseInt(text) || 0;
                        setPriceRange([Math.min(value, priceRange[1]), priceRange[1]]);
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={COLORS.text.tertiary}
                    />
                  </View>
                  <Text style={styles.priceSeparator}>-</Text>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceLabel}>Max:</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={priceRange[1].toString()}
                      onChangeText={(text) => {
                        const value = parseInt(text) || 100000;
                        setPriceRange([priceRange[0], Math.max(value, priceRange[0])]);
                      }}
                      keyboardType="numeric"
                      placeholder="100000"
                      placeholderTextColor={COLORS.text.tertiary}
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
                    .map(filter => {
                      const hasOptions = 'options' in filter && filter.options;

                      if (!hasOptions) return null;

                      return (
                        <View key={filter.id} style={styles.filterGroup}>
                          <Text style={styles.filterGroupLabel}>{filter.label}</Text>
                          <View style={styles.filterOptions}>
                            {filter.options.map(option => (
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
                      );
                    })}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <LinearGradient
                  colors={THEME.colors.gradients.primary}
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
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
    paddingTop: 50,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  menuButton: {
    padding: SPACING.xs,
  },
  compactTitle: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.black,
    color: COLORS.text.primary,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  compactHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  compactSearchButton: {
    padding: SPACING.xs,
  },
  compareButton: {
    position: 'relative',
    padding: SPACING.xs,
  },
  compareBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBadgeText: {
    fontSize: 8,
    color: COLORS.background,
    fontWeight: THEME.typography.fontWeights.black,
  },
  expandedHeader: {
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    marginBottom: 0,
  },
  title: {
    fontSize: THEME.typography.fontSizes['3xl'],
    fontWeight: THEME.typography.fontWeights.black,
    color: COLORS.text.primary,
    marginBottom: 2,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.secondary,
    letterSpacing: THEME.typography.letterSpacing.wide,
    fontWeight: THEME.typography.fontWeights.normal,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: THEME.typography.fontSizes.md,
    marginLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
    fontFamily: undefined, // Using system font
  },
  categorySection: {
    height: 40,
    justifyContent: 'center',
  },
  categoryTabs: {
    flexGrow: 0,
  },
  categoryTabsContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.xs,
  },
  categoryTabActive: {
    backgroundColor: THEME.components.badge.primary.backgroundColor,
    borderColor: THEME.components.badge.primary.borderColor,
  },
  categoryIcon: {
    marginRight: SPACING.xs,
  },
  categoryTabText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: COLORS.text.tertiary,
  },
  categoryTabTextActive: {
    color: THEME.components.badge.primary.textColor,
  },
  filterBar: {
    position: 'absolute',
    top: HEADER_EXPANDED_HEIGHT,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background + 'CC',
    zIndex: 90,
  },
  filterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  filterButtonText: {
    color: COLORS.primary,
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  activeFiltersBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    minWidth: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFiltersText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  filterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sortButtonText: {
    color: COLORS.text.secondary,
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  resultsBar: {
    position: 'absolute',
    top: HEADER_EXPANDED_HEIGHT + 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.background + 'CC',
    zIndex: 80,
  },
  resultsText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.secondary,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  resetLink: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.primary,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    zIndex: 99,
  },
  scrollToTopTouchable: {
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    ...SHADOWS.primary,
  },
  scrollToTopGradient: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    paddingTop: HEADER_EXPANDED_HEIGHT + 60,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  gridTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  componentCard: {
    width: CARD_WIDTH,
    marginRight: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: THEME.components.card.default.backgroundColor,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardContainer: {
    padding: SPACING.sm,
    height: 260,
    justifyContent: 'space-between',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 3,
  },
  stockText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  imageContainer: {
    width: '100%',
    height: 70,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  componentImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  componentType: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.text.tertiary,
    fontWeight: THEME.typography.fontWeights.semibold,
    letterSpacing: THEME.typography.letterSpacing.wide,
    marginBottom: 2,
  },
  componentName: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: COLORS.text.primary,
    lineHeight: THEME.typography.lineHeights.tight * THEME.typography.fontSizes.sm,
    marginBottom: SPACING.xs,
    flex: 1,
  },
  specsPreview: {
    marginBottom: SPACING.xs,
    gap: 1,
  },
  specPreviewText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.text.tertiary,
    fontWeight: THEME.typography.fontWeights.normal,
  },
  componentPrice: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compareIconButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.xs,
    borderWidth: 1,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.xs,
    gap: 2,
    borderWidth: 1,
  },
  viewButtonText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.semibold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    marginTop: HEADER_EXPANDED_HEIGHT + 50,
  },
  emptyStateText: {
    fontSize: THEME.typography.fontSizes.xl,
    color: COLORS.text.primary,
    fontWeight: THEME.typography.fontWeights.semibold,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: THEME.typography.lineHeights.normal * THEME.typography.fontSizes.md,
  },
  resetButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  modalTitle: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  resetAllText: {
    color: COLORS.primary,
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  filterContent: {
    padding: SPACING.lg,
  },
  filterSection: {
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSectionTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  priceInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  priceLabel: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.text.secondary,
    minWidth: 40,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  priceInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    color: COLORS.text.primary,
    fontSize: THEME.typography.fontSizes.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceSeparator: {
    fontSize: THEME.typography.fontSizes.xl,
    color: COLORS.text.tertiary,
    fontWeight: THEME.typography.fontWeights.bold,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.xs,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.text.primary,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  filterGroup: {
    marginBottom: SPACING.lg,
  },
  filterGroupLabel: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterOptionActive: {
    backgroundColor: THEME.components.badge.primary.backgroundColor,
    borderColor: THEME.components.badge.primary.borderColor,
  },
  filterOptionText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.secondary,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  filterOptionTextActive: {
    color: THEME.components.badge.primary.textColor,
  },
  modalActions: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  applyButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.primary,
  },
  applyButtonGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
});