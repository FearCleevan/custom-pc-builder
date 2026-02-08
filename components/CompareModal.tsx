import { useCompareStore } from '@/store/useCompareStore';
import { spacing } from '@/theme';
import { Product } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import {
  Dimensions,
  FlatList,
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
  fullScreen?: boolean;
}

interface ComparisonAnalysis {
  bestProduct: Product | null;
  analysis: Array<{
    spec: string;
    values: Array<{ productId: string; value: string; isBest: boolean }>;
    notes: string[];
  }>;
  recommendations: string[];
}

// Comparison rules for different component types
const COMPARISON_RULES: Record<string, Record<string, { better: 'higher' | 'lower', unit?: string }>> = {
  cpu: {
    'Core Count': { better: 'higher' },
    'Thread Count': { better: 'higher' },
    'Base Clock': { better: 'higher', unit: 'GHz' },
    'Max Boost Clock': { better: 'higher', unit: 'GHz' },
    'TDP': { better: 'lower', unit: 'W' },
    'L3 Cache': { better: 'higher', unit: 'MB' },
  },
  gpu: {
    'Memory Size': { better: 'higher', unit: 'GB' },
    'Boost Clock': { better: 'higher', unit: 'MHz' },
    'Memory Interface': { better: 'higher', unit: 'bit' },
    'TDP': { better: 'lower', unit: 'W' },
  },
  ram: {
    'Speed': { better: 'higher', unit: 'MHz' },
    'Total Capacity': { better: 'higher', unit: 'GB' },
    'CAS Latency': { better: 'lower' },
    'Voltage': { better: 'lower', unit: 'V' },
  },
  motherboard: {
    'Memory Slots': { better: 'higher' },
    'Maximum Memory': { better: 'higher', unit: 'GB' },
    'PCIe Slots': { better: 'higher' },
    'M.2 Slots': { better: 'higher' },
  },
  storage: {
    'Capacity': { better: 'higher', unit: 'GB' },
    'Sequential Read': { better: 'higher', unit: 'MB/s' },
    'Sequential Write': { better: 'higher', unit: 'MB/s' },
    'TBW': { better: 'higher', unit: 'TB' },
  },
  psu: {
    'Wattage': { better: 'higher', unit: 'W' },
    'Efficiency Rating': { better: 'higher' },
    'Warranty': { better: 'higher', unit: 'years' },
  },
  case: {
    'Max GPU Length': { better: 'higher', unit: 'mm' },
    'Max CPU Cooler Height': { better: 'higher', unit: 'mm' },
    '3.5" Drive Bays': { better: 'higher' },
    '2.5" Drive Bays': { better: 'higher' },
  },
  cooler: {
    'Radiator Size': { better: 'higher', unit: 'mm' },
    'Noise Level': { better: 'lower', unit: 'dB' },
    'Fan RPM': { better: 'higher', unit: 'RPM' },
    'Warranty': { better: 'higher', unit: 'years' },
  },
};

const VALUE_PATTERNS = {
  numeric: /^[\d.,]+/,
  unit: /[a-zA-Z%°]+$/,
  range: /[\d.,]+\s*-\s*[\d.,]+/,
};

export const CompareModal: React.FC<CompareModalProps> = ({ 
  visible, 
  onClose, 
  fullScreen = false 
}) => {
  const products = useCompareStore((state) => state.products);
  const removeProduct = useCompareStore((state) => state.removeProduct);
  const clearProducts = useCompareStore((state) => state.clearProducts);

  // Analyze and compare products
  const comparisonAnalysis = useMemo((): ComparisonAnalysis => {
    if (products.length < 2) {
      return { bestProduct: null, analysis: [], recommendations: [] };
    }

    const allSpecKeys = Array.from(
      new Set(products.flatMap(p => Object.keys(p.specs)))
    );

    const analysis = allSpecKeys.map(specKey => {
      const values = products.map(product => ({
        productId: product.id,
        value: product.specs[specKey] || '-',
        isBest: false,
      }));

      const componentType = products[0]?.type;
      const specRules = COMPARISON_RULES[componentType] || {};
      const rule = specRules[specKey];

      // Mark best values
      if (rule && values.every(v => v.value !== '-')) {
        const numericValues = values.map(v => {
          const match = String(v.value).match(VALUE_PATTERNS.numeric);
          return match ? parseFloat(match[0].replace(',', '')) : 0;
        });

        if (rule.better === 'higher') {
          const maxValue = Math.max(...numericValues);
          values.forEach((v, i) => {
            v.isBest = numericValues[i] === maxValue && maxValue > 0;
          });
        } else {
          const minValue = Math.min(...numericValues.filter(n => n > 0));
          values.forEach((v, i) => {
            v.isBest = numericValues[i] === minValue && minValue > 0;
          });
        }
      }

      // Generate notes
      const notes: string[] = [];
      if (rule) {
        const bestValues = values.filter(v => v.isBest);
        if (bestValues.length === 1) {
          const bestProduct = products.find(p => p.id === bestValues[0].productId);
          const unit = rule.unit ? ` ${rule.unit}` : '';
          notes.push(`${bestProduct?.name.split(' ')[0]} has the ${rule.better === 'higher' ? 'highest' : 'lowest'} ${specKey.toLowerCase()} (${bestValues[0].value}${unit})`);
        } else if (bestValues.length > 1) {
          notes.push(`Multiple products share the same ${specKey.toLowerCase()}`);
        }
      }

      return { spec: specKey, values, notes };
    });

    // Determine best product based on score
    const productScores = products.map(product => {
      let score = 0;
      analysis.forEach(({ spec, values }) => {
        const value = values.find(v => v.productId === product.id);
        if (value?.isBest) score += 2;
      });
      return { product, score };
    });

    const bestProduct = productScores.reduce((best, current) => 
      current.score > best.score ? current : best
    ).product;

    // Generate recommendations
    const recommendations: string[] = [];
    if (productScores[0].score > 0) {
      const winningSpecs = analysis.filter(a => 
        a.values.some(v => v.productId === bestProduct.id && v.isBest)
      ).map(a => a.spec);

      if (winningSpecs.length > 0) {
        recommendations.push(`${bestProduct.name.split(' ')[0]} is the best overall performer`);
        recommendations.push(`Leading in: ${winningSpecs.slice(0, 3).join(', ')}`);
      }

      // Price analysis
      const sortedByPrice = [...products].sort((a, b) => a.price - b.price);
      if (bestProduct.id === sortedByPrice[0].id) {
        recommendations.push('Best price-to-performance ratio');
      }
    }

    return { bestProduct, analysis, recommendations };
  }, [products]);

  const screenWidth = Dimensions.get('window').width;
  const maxProducts = Math.min(products.length, 4);
  const productWidth = (screenWidth - 120 - spacing.md * 2) / maxProducts;

  if (products.length === 0) return null;

  const renderProductHeader = (product: Product, index: number) => {
    const isBestOverall = comparisonAnalysis.bestProduct?.id === product.id;
    
    return (
      <View 
        key={product.id} 
        style={[
          styles.productColumn, 
          { width: productWidth },
          isBestOverall && styles.bestProductColumn
        ]}
      >
        <LinearGradient
          colors={isBestOverall ? ['#FF00FF', '#9400D3'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
          style={styles.productHeader}
        >
          {isBestOverall && (
            <View style={styles.bestBadge}>
              <Ionicons name="trophy" size={12} color="#FFF" />
              <Text style={styles.bestBadgeText}>BEST</Text>
            </View>
          )}
          
          <Text style={[
            styles.productName,
            isBestOverall && styles.bestProductText
          ]} numberOfLines={2}>
            {product.name}
          </Text>
          
          <Text style={[
            styles.productPrice,
            isBestOverall && styles.bestProductText
          ]}>
            ₱{product.price.toLocaleString()}
          </Text>
          
          <Text style={[
            styles.productType,
            isBestOverall && styles.bestProductText
          ]}>
            {product.type.toUpperCase()}
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.removeButton,
              isBestOverall && styles.bestRemoveButton
            ]}
            onPress={() => removeProduct(product.id)}
          >
            <Ionicons name="close-circle" size={20} color={isBestOverall ? "#FFF" : "#FF0000"} />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <LinearGradient
            colors={['#0a0a0f', '#1a1a2e']}
            style={styles.modalHeader}
          >
            <View style={styles.headerLeft}>
              <Ionicons name="git-compare" size={24} color="#00FFFF" />
              <View>
                <Text style={styles.modalTitle}>Compare Products</Text>
                <Text style={styles.modalSubtitle}>
                  {products.length}/4 components compared
                </Text>
              </View>
            </View>
            
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={clearProducts}
              >
                <Ionicons name="trash" size={20} color="#FF0000" />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Recommendations Section */}
          {comparisonAnalysis.recommendations.length > 0 && (
            <LinearGradient
              colors={['rgba(255, 0, 255, 0.1)', 'rgba(0, 255, 255, 0.05)']}
              style={styles.recommendationsSection}
            >
              <Text style={styles.recommendationsTitle}>
                <Ionicons name="bulb" size={16} color="#FFFF00" /> RECOMMENDATIONS
              </Text>
              <FlatList
                data={comparisonAnalysis.recommendations}
                renderItem={({ item }) => (
                  <View style={styles.recommendationItem}>
                    <Ionicons name="checkmark-circle" size={14} color="#00FF00" />
                    <Text style={styles.recommendationText}>{item}</Text>
                  </View>
                )}
                scrollEnabled={false}
              />
            </LinearGradient>
          )}

          {/* Comparison Table */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            <View style={styles.comparisonContainer}>
              {/* Spec Names Column */}
              <View style={styles.specNamesColumn}>
                <View style={styles.specNameHeader}>
                  <Text style={styles.specsTitle}>SPECIFICATIONS</Text>
                </View>
                {comparisonAnalysis.analysis.map(({ spec }) => (
                  <View key={spec} style={styles.specNameRow}>
                    <Text style={styles.specNameText}>{spec}</Text>
                  </View>
                ))}
              </View>

              {/* Product Columns */}
              <View style={styles.productsColumns}>
                {products.map(renderProductHeader)}
              </View>

              {/* Spec Values */}
              <ScrollView style={styles.specsScroll}>
                {comparisonAnalysis.analysis.map(({ spec, values, notes }) => (
                  <View key={spec} style={styles.specRow}>
                    {values.map(({ productId, value, isBest }) => {
                      const product = products.find(p => p.id === productId);
                      const componentType = product?.type;
                      const rule = componentType ? COMPARISON_RULES[componentType]?.[spec] : undefined;
                      
                      return (
                        <View 
                          key={productId} 
                          style={[
                            styles.specValueCell,
                            { width: productWidth },
                            isBest && styles.bestSpecValueCell
                          ]}
                        >
                          <Text style={[
                            styles.specValueText,
                            isBest && styles.bestSpecValueText
                          ]}>
                            {value}
                            {rule?.unit && typeof value === 'string' && !value.includes(rule.unit) ? ` ${rule.unit}` : ''}
                          </Text>
                          {isBest && (
                            <View style={styles.bestIndicator}>
                              <Ionicons name="star" size={10} color="#FFFF00" />
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Legend */}
          <View style={styles.legendSection}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF00FF' }]} />
              <Text style={styles.legendText}>Best Overall Product</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.bestSpecValueCell]} />
              <Text style={styles.legendText}>Best Value for Spec</Text>
            </View>
          </View>

          {/* Footer */}
          <LinearGradient
            colors={['rgba(10, 10, 15, 0.8)', 'rgba(10, 10, 15, 1)']}
            style={styles.footer}
          >
            <TouchableOpacity 
              style={styles.closeFooterButton}
              onPress={onClose}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.closeFooterButtonGradient}
              >
                <Ionicons name="close" size={20} color="#FFF" />
                <Text style={styles.closeFooterButtonText}>CLOSE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    marginTop: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  clearButtonText: {
    color: '#FF0000',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  recommendationsSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFF00',
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  recommendationText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
  },
  horizontalScroll: {
    flex: 1,
  },
  comparisonContainer: {
    paddingBottom: spacing.lg,
  },
  specNamesColumn: {
    width: 120,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  specsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00FFFF',
    letterSpacing: 2,
  },
  specNameHeader: {
    height: 140,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
  },
  specNameRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    minHeight: 60,
  },
  specNameText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  productsColumns: {
    flexDirection: 'row',
    position: 'absolute',
    left: 120,
  },
  productColumn: {
    marginRight: 1,
  },
  bestProductColumn: {
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  productHeader: {
    height: 140,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'space-between',
    position: 'relative',
  },
  bestBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 255, 0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  bestBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: spacing.xs,
  },
  bestProductText: {
    color: '#FFF',
    fontWeight: '800',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FF00FF',
    marginBottom: spacing.xs,
  },
  productType: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  removeButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
  bestRemoveButton: {},
  specsScroll: {
    marginTop: 140,
    marginLeft: 120,
  },
  specRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    minHeight: 60,
  },
  specValueCell: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  bestSpecValueCell: {
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    borderLeftWidth: 2,
    borderLeftColor: '#FF00FF',
  },
  specValueText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  bestSpecValueText: {
    color: '#FF00FF',
    fontWeight: '700',
  },
  bestIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  legendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  legendText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  closeFooterButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeFooterButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  closeFooterButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});