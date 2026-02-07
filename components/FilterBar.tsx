import { colors, spacing } from '@/theme';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface FilterOptions {
  minPrice?: number;
  maxPrice?: number;
  manufacturers?: string[];
  socket?: string;
  ramType?: string;
}

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  productType?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, productType }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onFilterChange({ ...filters });
  };

  const applyFilters = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const resetFilters = () => {
    const resetFilters = {};
    setFilters(resetFilters);
    setSearchQuery('');
    onFilterChange(resetFilters);
  };

  return (
    <>
      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              {/* Price Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.priceInputs}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Min $"
                    keyboardType="numeric"
                    value={filters.minPrice?.toString()}
                    onChangeText={(text) => applyFilters({ 
                      minPrice: text ? parseInt(text) * 100 : undefined 
                    })}
                    placeholderTextColor={colors.textSecondary}
                  />
                  <Text style={styles.priceSeparator}>to</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Max $"
                    keyboardType="numeric"
                    value={filters.maxPrice?.toString()}
                    onChangeText={(text) => applyFilters({ 
                      maxPrice: text ? parseInt(text) * 100 : undefined 
                    })}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              {/* Socket Filter (for CPUs/Motherboards) */}
              {(productType === 'cpu' || productType === 'motherboard') && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Socket</Text>
                  <View style={styles.filterChips}>
                    {['AM5', 'AM4', 'LGA1700', 'LGA1200'].map((socket) => (
                      <TouchableOpacity
                        key={socket}
                        style={[
                          styles.filterChip,
                          filters.socket === socket && styles.filterChipActive,
                        ]}
                        onPress={() => applyFilters({ 
                          socket: filters.socket === socket ? undefined : socket 
                        })}
                      >
                        <Text style={[
                          styles.filterChipText,
                          filters.socket === socket && styles.filterChipTextActive,
                        ]}>
                          {socket}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* RAM Type Filter */}
              {(productType === 'ram' || productType === 'motherboard') && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>RAM Type</Text>
                  <View style={styles.filterChips}>
                    {['DDR5', 'DDR4', 'DDR3'].map((ramType) => (
                      <TouchableOpacity
                        key={ramType}
                        style={[
                          styles.filterChip,
                          filters.ramType === ramType && styles.filterChipActive,
                        ]}
                        onPress={() => applyFilters({ 
                          ramType: filters.ramType === ramType ? undefined : ramType 
                        })}
                      >
                        <Text style={[
                          styles.filterChipText,
                          filters.ramType === ramType && styles.filterChipTextActive,
                        ]}>
                          {ramType}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  filterButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  filterButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
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
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeButton: {
    fontSize: 24,
    color: colors.textSecondary,
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
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceInput: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  priceSeparator: {
    color: colors.textSecondary,
    marginHorizontal: spacing.sm,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textLight,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  resetButton: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.textLight,
    fontWeight: '600',
  },
});