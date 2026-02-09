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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 3) / 2;

interface ComponentSelectionModalProps {
  slotType: ProductType | null;
  onSelect: (component: Product | null) => void;
  onClose: () => void;
  currentComponent: Product | null;
  buildState?: Record<string, Product | null>;
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

// Compatibility checker function
const checkCompatibility = (
  component: Product,
  slotType: ProductType,
  buildState: Record<string, Product | null>
): boolean => {
  if (!buildState) return true;

  switch (slotType) {
    case 'cpu':
      // CPU must be compatible with motherboard socket
      const motherboard = buildState.motherboard;
      if (motherboard) {
        const cpuSocket = component.specs.Socket;
        const mbSocket = motherboard.specs.Socket;
        return cpuSocket === mbSocket;
      }
      return true;

    case 'motherboard':
      // Motherboard must be compatible with CPU and RAM
      const cpu = buildState.cpu;
      const ram = buildState.ram;
      
      let compatible = true;
      
      if (cpu) {
        const cpuSocket = cpu.specs.Socket;
        const mbSocket = component.specs.Socket;
        compatible = compatible && cpuSocket === mbSocket;
      }
      
      if (ram) {
        const ramType = ram.specs['RAM Type'];
        const mbRamType = component.specs['RAM Type'];
        compatible = compatible && ramType === mbRamType;
      }
      
      return compatible;

    case 'ram':
      // RAM must be compatible with motherboard
      const mb = buildState.motherboard;
      if (mb) {
        const ramType = component.specs['RAM Type'];
        const mbRamType = mb.specs['RAM Type'];
        return ramType === mbRamType;
      }
      return true;

    case 'cooler':
      // Cooler must be compatible with CPU socket
      const cpuForCooler = buildState.cpu;
      if (cpuForCooler) {
        const cpuSocket = cpuForCooler.specs.Socket;
        const coolerSockets = component.specs['Socket Support'];
        return String(coolerSockets).includes(cpuSocket);
      }
      return true;

    case 'gpu':
      // GPU must fit in case
      const pcCase = buildState.case;
      if (pcCase) {
        const gpuLength = parseInt(String(component.specs['Card Length'] || '0'));
        const caseMaxGpuLength = parseInt(String(pcCase.specs['Max GPU Length'] || '999'));
        return gpuLength <= caseMaxGpuLength;
      }
      return true;

    case 'psu':
      // PSU wattage must be sufficient
      const totalPower = Object.values(buildState).reduce((total, comp) => {
        if (!comp) return total;
        const tdp = parseInt(String(comp.specs.TDP || '0'));
        return total + tdp;
      }, 0);
      
      const psuWattage = parseInt(String(component.specs.Wattage || '0'));
      // Add 20% headroom
      return psuWattage >= totalPower * 1.2;

    case 'case':
      // Case must fit motherboard and GPU
      const mbForCase = buildState.motherboard;
      const gpuForCase = buildState.gpu;
      
      let caseCompatible = true;
      
      if (mbForCase) {
        const mbFormFactor = mbForCase.specs['Form Factor'];
        const caseFormFactors = component.specs['Form Factor Support'] || '';
        caseCompatible = caseCompatible && String(caseFormFactors).includes(mbFormFactor);
      }
      
      if (gpuForCase) {
        const gpuLength = parseInt(String(gpuForCase.specs['Card Length'] || '0'));
        const caseMaxLength = parseInt(String(component.specs['Max GPU Length'] || '999'));
        caseCompatible = caseCompatible && gpuLength <= caseMaxLength;
      }
      
      return caseCompatible;

    default:
      return true;
  }
};

// Component-specific filters
const getComponentFilters = (type: ProductType) => {
  switch (type) {
    case 'cpu':
      return [
        { id: 'Socket', label: 'Socket', options: ['AM5', 'AM4', 'LGA1700', 'LGA1200'] },
        { id: 'Manufacturer', label: 'Brand', options: ['AMD', 'Intel'] },
        { id: 'Core Count', label: 'Min Cores', options: ['4+', '6+', '8+', '12+', '16+'] },
      ];
    
    case 'gpu':
      return [
        { id: 'VRAM', label: 'Min VRAM', options: ['4GB+', '6GB+', '8GB+', '12GB+', '16GB+'] },
        { id: 'Manufacturer', label: 'Brand', options: ['NVIDIA', 'AMD', 'ASUS', 'MSI', 'Gigabyte'] },
      ];
    
    case 'motherboard':
      return [
        { id: 'Socket', label: 'Socket', options: ['AM5', 'AM4', 'LGA1700'] },
        { id: 'RAM Type', label: 'RAM Type', options: ['DDR5', 'DDR4'] },
        { id: 'Chipset', label: 'Chipset', options: ['X670', 'B650', 'Z790', 'B760'] },
      ];
    
    case 'ram':
      return [
        { id: 'RAM Type', label: 'Type', options: ['DDR5', 'DDR4'] },
        { id: 'Total Capacity', label: 'Min Capacity', options: ['16GB+', '32GB+', '64GB+', '128GB+'] },
        { id: 'Speed', label: 'Min Speed', options: ['4800+', '5200+', '5600+', '6000+', '6400+'] },
      ];
    
    case 'storage':
      return [
        { id: 'Type', label: 'Type', options: ['NVMe SSD', 'SATA SSD', 'HDD'] },
        { id: 'Capacity', label: 'Min Capacity', options: ['500GB+', '1TB+', '2TB+', '4TB+'] },
      ];
    
    case 'psu':
      return [
        { id: 'Wattage', label: 'Min Wattage', options: ['500W+', '650W+', '750W+', '850W+', '1000W+'] },
        { id: 'Rating', label: 'Efficiency', options: ['80+ Bronze', '80+ Gold', '80+ Platinum', '80+ Titanium'] },
      ];
    
    case 'case':
      return [
        { id: 'Form Factor', label: 'Form Factor', options: ['Mini-ITX', 'Micro-ATX', 'ATX', 'E-ATX'] },
        { id: 'Color', label: 'Color', options: ['Black', 'White', 'RGB'] },
      ];
    
    default:
      return [];
  }
};

export const ComponentSelectionModal: React.FC<ComponentSelectionModalProps> = ({
  slotType,
  onSelect,
  onClose,
  currentComponent,
  buildState = {},
}) => {
  const [components, setComponents] = useState<Product[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceSort, setPriceSort] = useState<'low' | 'high' | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Product | null>(currentComponent);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [componentToRemove, setComponentToRemove] = useState<Product | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showAllProducts, setShowAllProducts] = useState(true);
  const [compatibleOnly, setCompatibleOnly] = useState(false);

  useEffect(() => {
    if (slotType) {
      const componentsList = getComponentsByType(slotType);
      setComponents(componentsList);
      applyFilters(componentsList);
      setSelectedComponent(currentComponent);
    }
  }, [slotType, currentComponent]);

  const applyFilters = (componentsList: Product[]) => {
    let filtered = [...componentsList];

    // Apply compatibility filter
    if (compatibleOnly && slotType) {
      filtered = filtered.filter(comp => 
        checkCompatibility(comp, slotType, buildState)
      );
    }

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

    // Apply advanced filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(component => {
          const specValue = component.specs[key];
          if (!specValue) return false;

          if (value.endsWith('+')) {
            const minValue = parseInt(value);
            const compValue = parseInt(String(specValue));
            return compValue >= minValue;
          }

          return String(specValue).includes(value);
        });
      }
    });

    // Apply price sorting
    if (priceSort === 'low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'high') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredComponents(filtered);
  };

  useEffect(() => {
    applyFilters(components);
  }, [searchQuery, priceSort, inStockOnly, filters, compatibleOnly, components]);

  const handleConfirmRemove = (component: Product) => {
    setComponentToRemove(component);
    setShowRemoveConfirmation(true);
  };

  const handleRemove = () => {
    if (componentToRemove) {
      setSelectedComponent(null);
      onSelect(null as any);
      setShowRemoveConfirmation(false);
      setComponentToRemove(null);
    }
  };

  const handleReselect = (newComponent: Product) => {
    setSelectedComponent(newComponent);
    onSelect(newComponent);
  };

  const handleSelectDifferent = () => {
    setSelectedComponent(null);
  };

  const handleFilterChange = (filterId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value === prev[filterId] ? '' : value
    }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setPriceSort(null);
    setInStockOnly(false);
    setFilters({});
    setShowAllProducts(true);
    setCompatibleOnly(false);
  };

  const handleCompatibleToggle = () => {
    setCompatibleOnly(!compatibleOnly);
    if (!compatibleOnly) {
      setShowAllProducts(false);
    }
  };

  const handleAllProductsToggle = () => {
    setShowAllProducts(!showAllProducts);
    if (!showAllProducts) {
      setCompatibleOnly(false);
    }
  };

  if (!slotType) {
    return null;
  }

  const componentFilters = getComponentFilters(slotType);
  const compatibleCount = components.filter(comp => 
    checkCompatibility(comp, slotType, buildState)
  ).length;

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

  // Advanced Filters Modal
  const AdvancedFiltersModal = () => (
    <Modal
      transparent={true}
      visible={showAdvancedFilters}
      animationType="slide"
      onRequestClose={() => setShowAdvancedFilters(false)}
    >
      <View style={styles.advancedFiltersOverlay}>
        <LinearGradient
          colors={['#0a0a0f', '#1a1a2e']}
          style={styles.advancedFiltersModal}
        >
          <View style={styles.advancedFiltersHeader}>
            <TouchableOpacity onPress={() => setShowAdvancedFilters(false)}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.advancedFiltersTitle}>Advanced Filters</Text>
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.resetFiltersText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.advancedFiltersContent}>
            {componentFilters.map(filter => (
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
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.applyFiltersButton}
            onPress={() => setShowAdvancedFilters(false)}
          >
            <LinearGradient
              colors={['#FF00FF', '#9400D3']}
              style={styles.applyFiltersButtonGradient}
            >
              <Text style={styles.applyFiltersButtonText}>APPLY FILTERS</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );

  return (
    <View style={styles.modalOverlay}>
      <RemoveConfirmationModal />
      <AdvancedFiltersModal />

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

          {/* Product Type Toggles */}
          <View style={styles.productTypeToggles}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                showAllProducts && styles.toggleButtonActive
              ]}
              onPress={handleAllProductsToggle}
            >
              <View style={[
                styles.toggleCheckbox,
                showAllProducts && styles.toggleCheckboxActive
              ]}>
                {showAllProducts && (
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                )}
              </View>
              <Text style={[
                styles.toggleText,
                showAllProducts && styles.toggleTextActive
              ]}>
                All Products ({components.length})
              </Text>
            </TouchableOpacity>

            {Object.keys(buildState).length > 0 && (
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  compatibleOnly && styles.toggleButtonActive
                ]}
                onPress={handleCompatibleToggle}
              >
                <View style={[
                  styles.toggleCheckbox,
                  compatibleOnly && styles.toggleCheckboxActive
                ]}>
                  {compatibleOnly && (
                    <Ionicons name="checkmark" size={12} color="#FFF" />
                  )}
                </View>
                <Text style={[
                  styles.toggleText,
                  compatibleOnly && styles.toggleTextActive
                ]}>
                  Compatible Only ({compatibleCount})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Compact Current Selection */}
        {selectedComponent && (
          <View style={styles.compactCurrentSelection}>
            <View style={styles.compactSelectionInfo}>
              <View style={styles.compactSelectionImage}>
                {selectedComponent.image ? (
                  <Image 
                    source={{ uri: selectedComponent.image }} 
                    style={styles.compactImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.compactImageText}>
                    {slotType.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.compactSelectionDetails}>
                <Text style={styles.compactSelectionName} numberOfLines={1}>
                  {selectedComponent.name}
                </Text>
                <Text style={styles.compactSelectionPrice}>
                  ₱{selectedComponent.price.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={styles.compactSelectionActions}>
              <TouchableOpacity
                style={styles.compactActionButton}
                onPress={handleSelectDifferent}
              >
                <Ionicons name="swap-horizontal" size={16} color="#FF00FF" />
                <Text style={styles.compactActionButtonText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.compactActionButton}
                onPress={() => handleConfirmRemove(selectedComponent)}
              >
                <Ionicons name="trash-outline" size={16} color="#FF0000" />
                <Text style={styles.compactActionButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Compact Filters */}
        <View style={styles.compactFilters}>
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={16} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${typeLabels[slotType]}...`}
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#666" />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.advancedFilterButton}
              onPress={() => setShowAdvancedFilters(true)}
            >
              <Ionicons name="options" size={18} color="#00FFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.quickFilters}>
            <TouchableOpacity
              style={[
                styles.quickFilterButton,
                priceSort === 'low' && styles.quickFilterButtonActive
              ]}
              onPress={() => setPriceSort(priceSort === 'low' ? null : 'low')}
            >
              <Text style={[
                styles.quickFilterButtonText,
                priceSort === 'low' && styles.quickFilterButtonTextActive
              ]}>
                Price ↑
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickFilterButton,
                priceSort === 'high' && styles.quickFilterButtonActive
              ]}
              onPress={() => setPriceSort(priceSort === 'high' ? null : 'high')}
            >
              <Text style={[
                styles.quickFilterButtonText,
                priceSort === 'high' && styles.quickFilterButtonTextActive
              ]}>
                Price ↓
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickFilterButton,
                inStockOnly && styles.quickFilterButtonActive
              ]}
              onPress={() => setInStockOnly(!inStockOnly)}
            >
              <Ionicons
                name={inStockOnly ? "checkbox" : "square-outline"}
                size={12}
                color={inStockOnly ? '#00FFFF' : '#666'}
              />
              <Text style={[
                styles.quickFilterButtonText,
                inStockOnly && styles.quickFilterButtonTextActive
              ]}>
                In Stock
              </Text>
            </TouchableOpacity>

            {(Object.keys(filters).length > 0 || searchQuery || priceSort || inStockOnly) && (
              <TouchableOpacity
                style={styles.quickFilterButton}
                onPress={resetFilters}
              >
                <Ionicons name="refresh" size={12} color="#FF00FF" />
                <Text style={styles.quickFilterButtonText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {filteredComponents.length} {typeLabels[slotType]}s Found
          </Text>
          <Text style={styles.resultsCount}>
            Showing {selectedComponent ? 'available options' : 'select one'}
          </Text>
        </View>

        {/* Components Grid (2 columns) */}
        <FlatList
          data={filteredComponents}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selectedComponent?.id === item.id;
            const isCompatible = checkCompatibility(item, slotType, buildState);

            return (
              <TouchableOpacity
                style={[
                  styles.gridCard,
                  isSelected && styles.gridCardSelected,
                  !isCompatible && styles.gridCardIncompatible
                ]}
                onPress={() => handleReselect(item)}
                activeOpacity={0.8}
                disabled={compatibleOnly && !isCompatible}
              >
                <LinearGradient
                  colors={isSelected
                    ? ['rgba(255, 0, 255, 0.15)', 'rgba(148, 0, 211, 0.1)']
                    : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                  }
                  style={styles.cardGradient}
                >
                  {/* Stock Badge */}
                  <View style={styles.gridStockBadge}>
                    <View style={[
                      styles.gridStockDot,
                      { backgroundColor: item.stock === 'In stock' ? '#00FF00' : '#FF0000' }
                    ]} />
                    <Text style={styles.gridStockText}>{item.stock}</Text>
                  </View>

                  {/* Compatibility Badge */}
                  {!isCompatible && (
                    <View style={styles.incompatibleBadge}>
                      <Ionicons name="warning" size={10} color="#FF0000" />
                      <Text style={styles.incompatibleText}>Incompatible</Text>
                    </View>
                  )}

                  {/* Component Image */}
                  <View style={styles.gridImageContainer}>
                    {item.image ? (
                      <Image 
                        source={{ uri: item.image }} 
                        style={styles.gridImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.gridImagePlaceholder}>
                        <Text style={styles.gridImageText}>
                          {slotType.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Component Name */}
                  <Text style={[
                    styles.gridComponentName,
                    isSelected && styles.gridComponentNameSelected
                  ]} numberOfLines={2}>
                    {item.name}
                  </Text>

                  {/* Price */}
                  <Text style={[
                    styles.gridPrice,
                    isSelected && styles.gridPriceSelected
                  ]}>
                    ₱{item.price.toLocaleString()}
                  </Text>

                  {/* Quick Spec */}
                  <Text style={styles.gridQuickSpec} numberOfLines={1}>
                    {slotType === 'cpu' ? `${item.specs['Core Count']} cores` :
                     slotType === 'gpu' ? `${item.specs.VRAM || item.specs['Memory Size']} VRAM` :
                     slotType === 'ram' ? `${item.specs['Total Capacity']} ${item.specs['RAM Type']}` :
                     slotType === 'storage' ? `${item.specs.Capacity || item.specs.Size}` :
                     'View details'}
                  </Text>

                  {/* Action Button */}
                  <TouchableOpacity
                    style={[
                      styles.gridActionButton,
                      isSelected ? styles.gridReselectButton : styles.gridSelectButton,
                      !isCompatible && styles.gridActionButtonDisabled
                    ]}
                    onPress={() => handleReselect(item)}
                    disabled={!isCompatible}
                  >
                    <Text style={styles.gridActionButtonText}>
                      {isSelected ? 'SELECTED' : 'SELECT'}
                    </Text>
                  </TouchableOpacity>
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
                Try adjusting your filters or search
              </Text>
              <TouchableOpacity
                style={styles.resetFiltersButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetFiltersButtonText}>RESET ALL FILTERS</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Compact Footer */}
        <View style={styles.compactFooter}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
          >
            <LinearGradient
              colors={['#FF00FF', '#9400D3']}
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
    height: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
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
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerRight: {
    width: 40,
  },
  productTypeToggles: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    flex: 1,
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderColor: '#FF00FF',
  },
  toggleCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCheckboxActive: {
    backgroundColor: '#FF00FF',
    borderColor: '#FF00FF',
  },
  toggleText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FF00FF',
  },
  compactCurrentSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 0, 255, 0.08)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.15)',
    marginBottom: spacing.sm,
  },
  compactSelectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactSelectionImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactImageText: {
    fontSize: 16,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
  },
  compactSelectionDetails: {
    flex: 1,
  },
  compactSelectionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  compactSelectionPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF00FF',
  },
  compactSelectionActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  compactActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  compactActionButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  compactFilters: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    marginLeft: 8,
    paddingVertical: 2,
  },
  advancedFilterButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  quickFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 4,
  },
  quickFilterButtonActive: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderColor: '#FF00FF',
  },
  quickFilterButtonText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  quickFilterButtonTextActive: {
    color: '#FF00FF',
  },
  resultsHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  resultsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00FFFF',
    letterSpacing: 1,
  },
  resultsCount: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  gridContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  gridCard: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gridCardSelected: {
    borderWidth: 2,
    borderColor: '#FF00FF',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gridCardIncompatible: {
    opacity: 0.6,
  },
  cardGradient: {
    padding: spacing.sm,
    height: 220,
    justifyContent: 'space-between',
  },
  gridStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 4,
  },
  gridStockDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 3,
  },
  gridStockText: {
    fontSize: 8,
    color: '#FFF',
    fontWeight: '600',
  },
  incompatibleBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  incompatibleText: {
    fontSize: 8,
    color: '#FF0000',
    fontWeight: '800',
  },
  gridImageContainer: {
    width: '100%',
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridImageText: {
    fontSize: 20,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
  },
  gridComponentName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
    lineHeight: 14,
    height: 28,
  },
  gridComponentNameSelected: {
    color: '#FF00FF',
  },
  gridPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF00FF',
    marginBottom: 2,
  },
  gridPriceSelected: {
    color: '#FF00FF',
  },
  gridQuickSpec: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: spacing.xs,
    height: 12,
  },
  gridActionButton: {
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  gridSelectButton: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.2)',
  },
  gridReselectButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  gridActionButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gridActionButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    width: SCREEN_WIDTH - spacing.md * 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resetFiltersButton: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.3)',
  },
  resetFiltersButtonText: {
    color: '#FF00FF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  compactFooter: {
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
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // Advanced Filters Modal Styles
  advancedFiltersOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  advancedFiltersModal: {
    height: SCREEN_HEIGHT * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  advancedFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  advancedFiltersTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  resetFiltersText: {
    color: '#FF00FF',
    fontSize: 14,
    fontWeight: '600',
  },
  advancedFiltersContent: {
    padding: spacing.lg,
    flex: 1,
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
    gap: 6,
  },
  filterOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
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
  applyFiltersButton: {
    margin: spacing.lg,
    borderRadius: 10,
    overflow: 'hidden',
  },
  applyFiltersButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  applyFiltersButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
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