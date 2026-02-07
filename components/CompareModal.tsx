import { useCompareStore } from '@/store/useCompareStore';
import { colors, spacing } from '@/theme';
import React from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CompareModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ visible, onClose }) => {
  const products = useCompareStore((state) => state.products);
  const removeProduct = useCompareStore((state) => state.removeProduct);
  const clearProducts = useCompareStore((state) => state.clearProducts);

  if (products.length === 0) return null;

  // Get all unique spec keys from all products
  const allSpecKeys = Array.from(
    new Set(products.flatMap(p => Object.keys(p.specs)))
  );

  const screenWidth = Dimensions.get('window').width;
  const productWidth = screenWidth / Math.min(products.length, 4) - spacing.md * 2;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Compare Products ({products.length}/4)</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearProducts}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.comparisonContainer}>
              {/* Spec names column */}
              <View style={styles.specNamesColumn}>
                <View style={styles.specNameHeader} />
                {allSpecKeys.map((key) => (
                  <View key={key} style={styles.specNameRow}>
                    <Text style={styles.specNameText}>{key}</Text>
                  </View>
                ))}
              </View>

              {/* Products columns */}
              {products.map((product) => (
                <View 
                  key={product.id} 
                  style={[styles.productColumn, { width: productWidth }]}
                >
                  <View style={styles.productHeader}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productPrice}>
                      ${(product.price / 100).toFixed(2)}
                    </Text>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeProduct(product.id)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {allSpecKeys.map((key) => (
                    <View key={key} style={styles.specValueRow}>
                      <Text style={styles.specValueText}>
                        {product.specs[key] || '-'}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalBackground,
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  clearButton: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearButtonText: {
    color: colors.error,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  comparisonContainer: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  specNamesColumn: {
    width: 120,
  },
  specNameHeader: {
    height: 120,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  specNameRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'center',
    minHeight: 50,
  },
  specNameText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  productColumn: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  productHeader: {
    height: 120,
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
    marginBottom: spacing.sm,
  },
  removeButton: {
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '600',
  },
  specValueRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 50,
    justifyContent: 'center',
  },
  specValueText: {
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});