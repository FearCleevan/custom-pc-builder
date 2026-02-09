import { getComponentsByType } from '@/data/mockData';
import { spacing } from '@/theme';
import { Product, ProductType } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ComponentSelectionModalProps {
  slotType: ProductType | null;
  onSelect: (component: Product | null) => void;
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
  monitor: 'Monitor',
  keyboard: 'Keyboard',
  mouse: 'Mouse',
  headphones: 'Headphones',
  microphone: 'Microphone',
  speakers: 'Speakers',
  webcam: 'Webcam',
  fan: 'Case Fan',
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
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [componentToRemove, setComponentToRemove] = useState<Product | null>(null);

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

  // const handleSelect = (component: Product) => {
  //   setSelectedComponent(component);
  //   onSelect(component);
  // };

  const handleConfirmRemove = (component: Product) => {
    setComponentToRemove(component);
    setShowRemoveConfirmation(true);
  };

  const handleRemove = () => {
    if (componentToRemove) {
      setSelectedComponent(null);
      // Pass null to indicate removal
      onSelect(null as any);
      setShowRemoveConfirmation(false);
      setComponentToRemove(null);
    }
  };

  const handleReselect = (newComponent: Product) => {
    // Directly replace the current selection with the new component
    setSelectedComponent(newComponent);
    onSelect(newComponent);
  };

  const handleSelectDifferent = () => {
    setSelectedComponent(null);
  };

  if (!slotType) {
    return null;
  }

  // Remove Confirmation Modal
  const RemoveConfirmationModal = () => (
    <Modal
      transparent={true}
      visible={showRemoveConfirmation}
      animationType="fade"
      onRequestClose={() => setShowRemoveConfirmation(false)}
    >
      <View style={styles.confirmationOverlay}>
        <View style={styles.confirmationModal}>
          <LinearGradient
            colors={['#0a0a0f', '#1a1a2e']}
            style={styles.confirmationContent}
          >
            <View style={styles.confirmationHeader}>
              <Ionicons name="warning" size={40} color="#FF0000" />
              <Text style={styles.confirmationTitle}>Remove Component</Text>
              <Text style={styles.confirmationMessage}>
                Are you sure you want to remove this {typeLabels[slotType].toLowerCase()}?
              </Text>

              {componentToRemove && (
                <View style={styles.componentToRemove}>
                  <Text style={styles.componentToRemoveName} numberOfLines={2}>
                    {componentToRemove.name}
                  </Text>
                  <Text style={styles.componentToRemovePrice}>
                    ₱{componentToRemove.price.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.confirmationActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRemoveConfirmation(false)}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.cancelButtonGradient}
                >
                  <Text style={styles.cancelButtonText}>CANCEL</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmRemoveButton}
                onPress={handleRemove}
              >
                <LinearGradient
                  colors={['#FF0000', '#8B0000']}
                  style={styles.confirmRemoveButtonGradient}
                >
                  <Ionicons name="trash" size={20} color="#FFF" />
                  <Text style={styles.confirmRemoveButtonText}>REMOVE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.modalOverlay}>
      <RemoveConfirmationModal />

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
                  <View style={styles.currentSelectionActions}>
                    {/* SELECT DIFFERENT Button */}
                    <TouchableOpacity
                      style={styles.selectDifferentButton}
                      onPress={handleSelectDifferent}
                    >
                      <Ionicons name="swap-horizontal" size={14} color="#FF00FF" />
                      <Text style={styles.selectDifferentButtonText}>SELECT DIFFERENT</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.removeCurrentButton}
                      onPress={() => handleConfirmRemove(selectedComponent)}
                    >
                      <Ionicons name="trash-outline" size={14} color="#FF0000" />
                      <Text style={styles.removeCurrentButtonText}>REMOVE</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.currentSelectionContent}>
                  {/* Current Component Image */}
                  <View style={styles.currentComponentImage}>
                    {selectedComponent.image ? (
                      <Image 
                        source={{ uri: selectedComponent.image }} 
                        style={styles.currentComponentImageContent}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.currentComponentImageText}>
                        {slotType.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>

                  <View style={styles.selectionInfo}>
                    <Text style={styles.selectionName} numberOfLines={2}>
                      {selectedComponent.name}
                    </Text>
                    <Text style={styles.selectionPrice}>
                      ₱{selectedComponent.price.toLocaleString()}
                    </Text>
                    
                    {/* Show quantity for RAM and Storage */}
                    {['ram', 'storage'].includes(slotType) && selectedComponent.quantity && (
                      <View style={styles.currentQuantity}>
                        <Text style={styles.currentQuantityText}>
                          Quantity: {selectedComponent.quantity} {slotType === 'ram' ? 'sticks' : 'drives'}
                        </Text>
                      </View>
                    )}
                    
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
            <Ionicons name="search" size={18} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${typeLabels[slotType]}...`}
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
                size={14}
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
                onPress={() => handleReselect(item)}
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
                      <Ionicons name="checkmark-circle" size={16} color="#FF00FF" />
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
                        style={styles.reselectButtonSmall}
                        onPress={() => handleReselect(item)}
                      >
                        <Ionicons name="refresh" size={12} color="#00FFFF" />
                        <Text style={styles.reselectButtonSmallText}>RESELECT</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.selectButtonSmall}
                        onPress={() => handleReselect(item)}
                      >
                        <Text style={styles.selectButtonSmallText}>SELECT</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Component Image */}
                  <View style={styles.componentImageContainer}>
                    {item.image ? (
                      <Image 
                        source={{ uri: item.image }} 
                        style={styles.componentImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.componentImagePlaceholder}>
                        <Text style={styles.componentImageText}>
                          {slotType.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
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
                        isSelected ? styles.reselectButtonLarge : styles.selectButtonLarge
                      ]}
                      onPress={() => handleReselect(item)}
                    >
                      <LinearGradient
                        colors={isSelected ? ['#00FFFF', '#008B8B'] : ['#FF00FF', '#9400D3']}
                        style={styles.actionButtonGradient}
                      >
                        <Text style={styles.actionButtonText}>
                          {isSelected ? 'RESELECT' : 'SELECT'}
                        </Text>
                        <Ionicons
                          name={isSelected ? "refresh" : "checkmark"}
                          size={14}
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
              <Ionicons name="search-outline" size={40} color="#666" />
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  headerRight: {
    width: 40,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  currentSelection: {
    marginTop: spacing.md,
  },
  currentSelectionGradient: {
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.2)',
  },
  currentSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  currentSelectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF00FF',
    letterSpacing: 1.5,
  },
  currentSelectionActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  selectDifferentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.2)',
  },
  selectDifferentButtonText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF00FF',
    letterSpacing: 0.5,
  },
  removeCurrentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  removeCurrentButtonText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF0000',
    letterSpacing: 0.5,
  },
  currentSelectionContent: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  currentComponentImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  currentComponentImageContent: {
    width: '100%',
    height: '100%',
  },
  currentComponentImageText: {
    fontSize: 20,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
  },
  selectionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  selectionName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
    lineHeight: 16,
  },
  selectionPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF00FF',
    marginBottom: 4,
  },
  currentQuantity: {
    marginBottom: 6,
  },
  currentQuantityText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  selectionStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectionStockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  selectionStockText: {
    fontSize: 10,
    fontWeight: '600',
  },
  filtersContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    marginLeft: 10,
    paddingVertical: 2,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderColor: '#FF00FF',
  },
  filterButtonText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FF00FF',
  },
  listHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  listHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00FFFF',
    letterSpacing: 1.5,
  },
  listHeaderCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  componentCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  componentCardSelected: {
    borderWidth: 2,
    borderColor: '#FF00FF',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: spacing.md,
  },
  selectedIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  selectedIndicatorText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF00FF',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
  },
  selectButtonSmall: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  selectButtonSmallText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00FFFF',
    letterSpacing: 0.5,
  },
  reselectButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  reselectButtonSmallText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00FFFF',
    letterSpacing: 0.5,
  },
  componentImageContainer: {
    width: '100%',
    height: 80,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  componentImage: {
    width: '100%',
    height: '100%',
  },
  componentImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  componentImageText: {
    fontSize: 28,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
  },
  componentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  componentNameSelected: {
    color: '#FF00FF',
    fontWeight: '700',
  },
  specsPreview: {
    marginBottom: spacing.md,
    gap: 4,
  },
  specText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 14,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#FF00FF',
  },
  componentPriceSelected: {
    color: '#FF00FF',
  },
  actionButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  selectButtonLarge: {
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  reselectButtonLarge: {
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
  },
  doneButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  doneButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // Confirmation Modal Styles
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  confirmationModal: {
    width: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  confirmationContent: {
    padding: spacing.lg,
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  confirmationMessage: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  componentToRemove: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
    width: '100%',
    marginTop: spacing.md,
  },
  componentToRemoveName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  componentToRemovePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF0000',
    textAlign: 'center',
  },
  confirmationActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cancelButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  confirmRemoveButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  confirmRemoveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: 6,
  },
  confirmRemoveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});