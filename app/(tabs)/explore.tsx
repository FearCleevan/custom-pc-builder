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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;
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

            // If Series is not in specs, derive it from Chipset
            if (!seriesValue) {
              const chipsetValue = component.specs['Chipset'];
              if (chipsetValue) {
                seriesValue = getGPUSeries(chipsetValue);
              }
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
          colors={['#000000', '#1a1a2e']}
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
              <Ionicons name="filter" size={22} color="#FF00FF" />
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
                <Ionicons name="search" size={20} color="#00FFFF" />
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
                <Ionicons name="git-compare" size={20} color="#00FFFF" />
                {compareProducts.length > 0 && (
                  <View style={styles.compareBadge}>
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
              <Ionicons name="search" size={18} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${selectedCategory === 'all' ? 'components' : selectedCategory}...`}
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#666" />
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
            <Ionicons name="filter" size={18} color="#FF00FF" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>

          {Object.keys(filters).filter(key => filters[key] !== null).length > 0 && (
            <View style={styles.activeFiltersBadge}>
              <Text style={styles.activeFiltersText}>
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
            <Ionicons name="chevron-down" size={14} color="#666" />
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
            colors={['#FF00FF', '#9400D3']}
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
                  style={styles.compareIconButton}
                  onPress={() => handleAddToCompare(item)}
                  disabled={compareProducts.some(p => p.id === item.id)}
                >
                  <Ionicons
                    name="git-compare"
                    size={14}
                    color={compareProducts.some(p => p.id === item.id) ? '#666' : '#00FFFF'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleComponentPress(item)}
                >
                  <Text style={styles.viewButtonText}>VIEW</Text>
                  <Ionicons name="arrow-forward" size={10} color="#00FFFF" />
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
                      onChangeText={(text) => {
                        const value = parseInt(text) || 0;
                        setPriceRange([Math.min(value, priceRange[1]), priceRange[1]]);
                      }}
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
                      onChangeText={(text) => {
                        const value = parseInt(text) || 100000;
                        setPriceRange([priceRange[0], Math.max(value, priceRange[0])]);
                      }}
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
    paddingHorizontal: spacing.lg,
  },
  menuButton: {
    padding: spacing.xs,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(255, 0, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  compactHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  compactSearchButton: {
    padding: spacing.xs,
  },
  compareButton: {
    position: 'relative',
    padding: spacing.xs,
  },
  compareBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#00FFFF',
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBadgeText: {
    fontSize: 8,
    color: '#0a0a0f',
    fontWeight: '900',
  },
  expandedHeader: {
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    marginBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 2,
    textShadowColor: 'rgba(255, 0, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    marginLeft: spacing.sm,
    paddingVertical: spacing.xs,
  },
  categorySection: {
    height: 40,
    justifyContent: 'center',
  },
  categoryTabs: {
    flexGrow: 0,
  },
  categoryTabsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: spacing.xs,
  },
  categoryTabActive: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderColor: '#FF00FF',
  },
  categoryIcon: {
    marginRight: spacing.xs,
  },
  categoryTabText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  categoryTabTextActive: {
    color: '#FF00FF',
  },
  filterBar: {
    position: 'absolute',
    top: HEADER_EXPANDED_HEIGHT,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
    zIndex: 90,
  },
  filterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterButtonText: {
    color: '#FF00FF',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFiltersBadge: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFiltersText: {
    fontSize: 9,
    color: '#FF00FF',
    fontWeight: '600',
  },
  filterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sortButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  resultsBar: {
    position: 'absolute',
    top: HEADER_EXPANDED_HEIGHT + 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
    zIndex: 80,
  },
  resultsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  resetLink: {
    fontSize: 12,
    color: '#FF00FF',
    fontWeight: '600',
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    zIndex: 99,
  },
  scrollToTopTouchable: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollToTopGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    paddingTop: HEADER_EXPANDED_HEIGHT + 60,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  componentCard: {
    width: CARD_WIDTH,
    marginRight: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: spacing.sm,
    height: 260,
    justifyContent: 'space-between',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  stockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 3,
  },
  stockText: {
    fontSize: 8,
    color: '#FFF',
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    height: 70,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    overflow: 'hidden',
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
  imageText: {
    fontSize: 24,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
  },
  componentType: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  componentName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    lineHeight: 14,
    marginBottom: spacing.xs,
    flex: 1,
  },
  specsPreview: {
    marginBottom: spacing.xs,
    gap: 1,
  },
  specPreviewText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
  },
  componentPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF00FF',
    marginBottom: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compareIconButton: {
    padding: spacing.xs,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  viewButtonText: {
    fontSize: 8,
    color: '#00FFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    marginTop: HEADER_EXPANDED_HEIGHT + 50,
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