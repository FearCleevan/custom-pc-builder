import {
  allComponents,
  componentCategories,
  ComponentItem,
  getComponentsByType
} from '@/data/mockData';
import { useBuildStore } from '@/store/useBuildStore';
import { useCompareStore } from '@/store/useCompareStore';
import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(params.category || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState('name');
  const [inStockOnly, setInStockOnly] = useState(false);
  
  const addPart = useBuildStore((state) => state.addPart);
  const addToCompare = useCompareStore((state) => state.addProduct);

  // Get components based on selected category
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

  const handleComponentPress = (component: ComponentItem) => {
    router.push({
      pathname: '/(modals)/component-details',
      params: {
        id: component.id,
        type: component.type,
        from: 'explore'
      }
    });
  };

  const handleAddToBuild = (component: ComponentItem) => {
    addPart(component);
    Alert.alert(
      'Added to Build',
      `${component.name} has been added to your build.`,
      [{ text: 'OK' }]
    );
  };

  const handleAddToCompare = (component: ComponentItem) => {
    addToCompare(component);
    Alert.alert(
      'Added to Compare',
      `${component.name} has been added to compare.`,
      [{ text: 'OK' }]
    );
  };

  const handleQuickAdd = (component: ComponentItem) => {
    addPart(component);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0a0a0f', '#1a1a2e']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Browse Components</Text>
          <Text style={styles.subtitle}>
            {selectedCategory === 'all' 
              ? 'All Products' 
              : componentCategories.find(c => c.id === selectedCategory)?.name}
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
        </View>
      </LinearGradient>

      {/* Category Tabs */}
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
              color={selectedCategory === category.id ? '#FF00FF' : '#666'}
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

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color="#FF00FF" />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            // Show sort options modal
            Alert.alert(
              'Sort By',
              '',
              [
                { text: 'Name', onPress: () => setSortBy('name') },
                { text: 'Price: Low to High', onPress: () => setSortBy('price-low') },
                { text: 'Price: High to Low', onPress: () => setSortBy('price-high') },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          }}
        >
          <Text style={styles.sortButtonText}>
            Sort: {sortBy === 'price-low' ? 'Price ↑' : 
                  sortBy === 'price-high' ? 'Price ↓' : 'Name'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
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

              {/* Component Type */}
              <Text style={styles.componentType}>
                {item.type.toUpperCase()}
              </Text>

              {/* Component Name */}
              <Text style={styles.componentName} numberOfLines={2}>
                {item.name}
              </Text>

              {/* Component Price */}
              <Text style={styles.componentPrice}>
                ₱{item.price.toLocaleString()}
              </Text>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.compareButton}
                  onPress={() => handleAddToCompare(item)}
                >
                  <Ionicons name="git-compare" size={16} color="#00FFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddToBuild(item)}
                >
                  <Ionicons name="add-circle" size={18} color="#FF00FF" />
                  <Text style={styles.addButtonText}>Add to Build</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#666" />
            <Text style={styles.emptyStateText}>
              No components found matching your criteria.
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange([0, 100000]);
                setSortBy('name');
                setInStockOnly(false);
              }}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Filters Modal */}
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
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.filterContent}>
              {/* Price Range Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <Text style={styles.priceRangeText}>
                  ₱{priceRange[0].toLocaleString()} - ₱{priceRange[1].toLocaleString()}
                </Text>
                {/* Add Slider Component here */}
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

              {/* Reset Button */}
              <TouchableOpacity
                style={styles.modalResetButton}
                onPress={() => {
                  setPriceRange([0, 100000]);
                  setInStockOnly(false);
                }}
              >
                <Text style={styles.modalResetButtonText}>Reset All Filters</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
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
  header: {
    paddingTop: 60,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
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
  categoryTabs: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  categoryTabsContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sortButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  grid: {
    padding: spacing.lg,
  },
  componentCard: {
    width: CARD_WIDTH,
    marginRight: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: spacing.md,
    height: 200,
    justifyContent: 'space-between',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
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
  componentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF00FF',
    marginBottom: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compareButton: {
    padding: spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  addButtonText: {
    fontSize: 10,
    color: '#FF00FF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: spacing.md,
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
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0a0a0f',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  filterContent: {
    padding: spacing.lg,
  },
  filterSection: {
    marginBottom: spacing.xl,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: spacing.md,
  },
  priceRangeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF00FF',
    marginBottom: spacing.md,
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
  modalResetButton: {
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.3)',
    borderRadius: 12,
    marginTop: spacing.lg,
  },
  modalResetButtonText: {
    color: '#FF00FF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalActions: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  applyButton: {
    backgroundColor: '#FF00FF',
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});