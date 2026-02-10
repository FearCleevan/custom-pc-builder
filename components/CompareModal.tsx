import { useCompareStore } from '@/store/useCompareStore';
import { THEME } from '@/theme/indexs';
import { Product } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { colors: COLORS, spacing: SPACING, borderRadius: BORDER_RADIUS, shadows: SHADOWS } = THEME;

interface CompareModalProps {
  visible: boolean;
  onClose: () => void;
  fullScreen?: boolean;
}

interface ComparisonResult {
  spec: string;
  values: {
    productId: string;
    value: string;
    isBest: boolean;
    isWorst: boolean;
    description: string;
  }[];
  bestProductId: string | null;
  worstProductId: string | null;
  analysis: string;
}

interface ComponentComparison {
  id: string;
  name: string;
  price: number;
  type: string;
  specs: Record<string, any>;
  rating?: number;
}

// Comparison rules for different component types
const COMPARISON_RULES: Record<string, Record<string, { 
  better: 'higher' | 'lower'; 
  unit?: string;
  weight: number; // Importance weight for scoring
  description: (value: any) => string;
}>> = {
  cpu: {
    'Core Count': { 
      better: 'higher', 
      unit: 'Cores',
      weight: 0.3,
      description: (v) => `More cores for better multitasking`
    },
    'Thread Count': { 
      better: 'higher', 
      unit: 'Threads',
      weight: 0.2,
      description: (v) => `More threads improve parallel processing`
    },
    'Base Clock': { 
      better: 'higher', 
      unit: 'GHz',
      weight: 0.15,
      description: (v) => `Higher base clock speeds`
    },
    'Max Boost Clock': { 
      better: 'higher', 
      unit: 'GHz',
      weight: 0.2,
      description: (v) => `Higher boost for peak performance`
    },
    'TDP': { 
      better: 'lower', 
      unit: 'W',
      weight: 0.1,
      description: (v) => `Lower power consumption`
    },
    'L3 Cache': { 
      better: 'higher', 
      unit: 'MB',
      weight: 0.05,
      description: (v) => `Larger cache improves data access`
    },
  },
  gpu: {
    'Memory Size': { 
      better: 'higher', 
      unit: 'GB',
      weight: 0.25,
      description: (v) => `More VRAM for higher resolutions/textures`
    },
    'Boost Clock': { 
      better: 'higher', 
      unit: 'MHz',
      weight: 0.2,
      description: (v) => `Higher clock speeds for better performance`
    },
    'Memory Interface': { 
      better: 'higher', 
      unit: 'bit',
      weight: 0.15,
      description: (v) => `Wider memory bus for faster data transfer`
    },
    'TDP': { 
      better: 'lower', 
      unit: 'W',
      weight: 0.1,
      description: (v) => `Lower power consumption and heat`
    },
    'CUDA Cores': { 
      better: 'higher', 
      weight: 0.3,
      description: (v) => `More cores for parallel processing`
    },
  },
  ram: {
    'Speed': { 
      better: 'higher', 
      unit: 'MHz',
      weight: 0.4,
      description: (v) => `Faster memory speeds`
    },
    'Total Capacity': { 
      better: 'higher', 
      unit: 'GB',
      weight: 0.4,
      description: (v) => `More RAM for multitasking`
    },
    'CAS Latency': { 
      better: 'lower',
      weight: 0.2,
      description: (v) => `Lower latency for faster response`
    },
  },
  storage: {
    'Capacity': { 
      better: 'higher', 
      unit: 'GB',
      weight: 0.4,
      description: (v) => `More storage space`
    },
    'Sequential Read': { 
      better: 'higher', 
      unit: 'MB/s',
      weight: 0.3,
      description: (v) => `Faster read speeds`
    },
    'Sequential Write': { 
      better: 'higher', 
      unit: 'MB/s',
      weight: 0.3,
      description: (v) => `Faster write speeds`
    },
  },
  psu: {
    'Wattage': { 
      better: 'higher', 
      unit: 'W',
      weight: 0.3,
      description: (v) => `Higher wattage for more components`
    },
    'Efficiency Rating': { 
      better: 'higher', 
      weight: 0.4,
      description: (v) => `Better efficiency saves power`
    },
    'Warranty': { 
      better: 'higher', 
      unit: 'years',
      weight: 0.3,
      description: (v) => `Longer warranty period`
    },
  },
};

// Extract numeric value from spec
const extractNumericValue = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  
  const str = String(value);
  const numericMatch = str.match(/[\d,.]+/);
  if (numericMatch) {
    return parseFloat(numericMatch[0].replace(/,/g, ''));
  }
  return 0;
};

// Format value with unit
const formatValue = (value: any, unit?: string): string => {
  const num = extractNumericValue(value);
  if (unit && num > 0) {
    return `${num} ${unit}`;
  }
  return String(value);
};

export const CompareModal: React.FC<CompareModalProps> = ({ 
  visible, 
  onClose, 
  fullScreen = false 
}) => {
  const products = useCompareStore((state) => state.products);
  const removeProduct = useCompareStore((state) => state.removeProduct);
  const clearProducts = useCompareStore((state) => state.clearProducts);

  // Check if all products are same type
  const canCompare = useMemo(() => {
    if (products.length < 2) return false;
    const firstType = products[0].type;
    return products.every(product => product.type === firstType);
  }, [products]);

  // Get comparison results
  const comparisonResults = useMemo(() => {
    if (!canCompare || products.length < 2) return [];

    const componentType = products[0].type;
    const rules = COMPARISON_RULES[componentType] || {};
    const allSpecs = Array.from(
      new Set(products.flatMap(p => Object.keys(p.specs)))
    ).filter(spec => rules[spec]);

    const results: ComparisonResult[] = allSpecs.map(spec => {
      const rule = rules[spec];
      const values = products.map(product => ({
        productId: product.id,
        value: product.specs[spec] || 'N/A',
        numericValue: extractNumericValue(product.specs[spec]),
      }));

      // Determine best and worst
      let bestProductId: string | null = null;
      let worstProductId: string | null = null;
      let bestValue = rule.better === 'higher' ? -Infinity : Infinity;
      let worstValue = rule.better === 'higher' ? Infinity : -Infinity;

      values.forEach(({ productId, numericValue }) => {
        if (numericValue === 0) return; // Skip invalid values
        
        if (rule.better === 'higher') {
          if (numericValue > bestValue) {
            bestValue = numericValue;
            bestProductId = productId;
          }
          if (numericValue < worstValue) {
            worstValue = numericValue;
            worstProductId = productId;
          }
        } else {
          if (numericValue < bestValue) {
            bestValue = numericValue;
            bestProductId = productId;
          }
          if (numericValue > worstValue) {
            worstValue = numericValue;
            worstProductId = productId;
          }
        }
      });

      // Create analysis description
      const bestProduct = products.find(p => p.id === bestProductId);
      const worstProduct = products.find(p => p.id === worstProductId);
      
      let analysis = '';
      if (bestProduct && worstProduct && bestProductId !== worstProductId) {
        const bestValueStr = formatValue(bestValue, rule.unit);
        const worstValueStr = formatValue(worstValue, rule.unit);
        analysis = `${bestProduct.name.split(' ')[0]} leads with ${bestValueStr} vs ${worstProduct.name.split(' ')[0]}'s ${worstValueStr}. ${rule.description(bestValue)}`;
      } else if (bestProduct) {
        analysis = `All products have similar ${spec.toLowerCase()}`;
      }

      return {
        spec,
        values: values.map(v => ({
          ...v,
          formattedValue: formatValue(v.value, rule.unit),
          isBest: v.productId === bestProductId,
          isWorst: v.productId === worstProductId,
          description: rule.description(v.numericValue),
        })),
        bestProductId,
        worstProductId,
        analysis,
      };
    });

    return results;
  }, [products, canCompare]);

  // Calculate overall scores
  const productScores = useMemo(() => {
    if (!canCompare) return [];

    const componentType = products[0].type;
    const rules = COMPARISON_RULES[componentType] || {};
    
    return products.map(product => {
      let score = 0;
      let totalWeight = 0;
      
      Object.entries(rules).forEach(([spec, rule]) => {
        const value = product.specs[spec];
        if (value !== undefined) {
          const numValue = extractNumericValue(value);
          if (numValue > 0) {
            // Normalize score based on rule
            if (rule.better === 'higher') {
              score += numValue * rule.weight;
            } else {
              score += (1 / Math.max(numValue, 1)) * rule.weight;
            }
            totalWeight += rule.weight;
          }
        }
      });
      
      // Add price factor (lower is better)
      const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
      const priceScore = (avgPrice / Math.max(product.price, 1)) * 0.2;
      score += priceScore;
      totalWeight += 0.2;
      
      return {
        product,
        score: totalWeight > 0 ? score / totalWeight : 0,
        pricePerf: product.price > 0 ? score / product.price : 0,
      };
    }).sort((a, b) => b.score - a.score);
  }, [products, canCompare]);

  const screenWidth = Dimensions.get('window').width;
  const maxProducts = Math.min(products.length, 4);
  const productWidth = (screenWidth - 120 - SPACING.md * 2) / maxProducts;

  if (products.length === 0) return null;

  const renderProductHeader = (product: Product, index: number) => {
    const score = productScores.find(s => s.product.id === product.id);
    const isBestOverall = index === 0 && productScores.length > 1;
    
    return (
      <View 
        key={product.id} 
        style={[
          styles.productColumn, 
          { width: productWidth },
          isBestOverall && styles.bestProductColumn
        ]}
      >
        <View
          style={[
            styles.productHeader,
            isBestOverall && { 
              backgroundColor: COLORS.primary + '20',
              borderColor: COLORS.primary + '40'
            }
          ]}
        >
          {isBestOverall && (
            <View style={[
              styles.bestBadge,
              { 
                backgroundColor: THEME.components.badge.primary.backgroundColor,
                borderColor: THEME.components.badge.primary.borderColor
              }
            ]}>
              <Ionicons name="trophy" size={12} color={THEME.components.badge.primary.textColor} />
              <Text style={[
                styles.bestBadgeText,
                { color: THEME.components.badge.primary.textColor }
              ]}>BEST</Text>
            </View>
          )}
          
          <Text style={[
            styles.productName,
            isBestOverall && { color: COLORS.primary }
          ]} numberOfLines={2}>
            {product.name}
          </Text>
          
          <Text style={[
            styles.productPrice,
            isBestOverall && { color: COLORS.primary }
          ]}>
            ₱{product.price.toLocaleString()}
          </Text>
          
          <Text style={[
            styles.productType,
            isBestOverall && { color: COLORS.text.primary }
          ]}>
            {product.type.toUpperCase()}
          </Text>
          
          {score && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                Score: {score.score.toFixed(1)}
              </Text>
              <Text style={styles.pricePerfText}>
                Value: {(score.pricePerf * 1000).toFixed(0)}
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => removeProduct(product.id)}
          >
            <Ionicons 
              name="close-circle" 
              size={20} 
              color={isBestOverall ? COLORS.primary : COLORS.danger} 
            />
          </TouchableOpacity>
        </View>
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
            colors={THEME.colors.gradients.dark}
            style={styles.modalHeader}
          >
            <View style={styles.headerLeft}>
              <Ionicons name="git-compare" size={24} color={COLORS.secondary} />
              <View>
                <Text style={styles.modalTitle}>Compare Products</Text>
                <Text style={styles.modalSubtitle}>
                  {products.length}/4 {products[0]?.type.toUpperCase()} compared
                </Text>
              </View>
            </View>
            
            <View style={styles.headerButtons}>
              {!canCompare && products.length > 1 && (
                <View style={styles.warningBadge}>
                  <Ionicons name="warning" size={16} color={COLORS.warning} />
                  <Text style={styles.warningText}>Same type only</Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.clearButton,
                  { 
                    backgroundColor: THEME.components.badge.danger.backgroundColor,
                    borderColor: THEME.components.badge.danger.borderColor
                  }
                ]}
                onPress={clearProducts}
              >
                <Ionicons name="trash" size={20} color={THEME.components.badge.danger.textColor} />
                <Text style={[
                  styles.clearButtonText,
                  { color: THEME.components.badge.danger.textColor }
                ]}>Clear All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Warning for mixed product types */}
          {!canCompare && products.length > 1 && (
            <View style={[
              styles.warningSection,
              { 
                backgroundColor: COLORS.warning + '20',
                borderColor: COLORS.warning
              }
            ]}>
              <Ionicons name="warning" size={20} color={COLORS.warning} />
              <Text style={[styles.warningMessage, { color: COLORS.warning }]}>
                You can only compare products of the same type. Please select components from the same category.
              </Text>
            </View>
          )}

          {/* Overall Recommendations */}
          {canCompare && productScores.length > 0 && (
            <View style={[
              styles.recommendationsSection,
              { 
                backgroundColor: COLORS.surfaceLight,
                borderColor: COLORS.border 
              }
            ]}>
              <Text style={[
                styles.recommendationsTitle,
                { color: COLORS.primary }
              ]}>
                <Ionicons name="bulb" size={16} color={COLORS.primary} /> RECOMMENDATIONS
              </Text>
              
              <View style={styles.recommendationGrid}>
                {productScores.map(({ product, score, pricePerf }, index) => (
                  <View key={product.id} style={styles.recommendationCard}>
                    <View style={styles.recommendationHeader}>
                      <Text style={styles.recommendationRank}>#{index + 1}</Text>
                      <Text style={styles.recommendationName} numberOfLines={1}>
                        {product.name.split(' ')[0]}
                      </Text>
                    </View>
                    <Text style={styles.recommendationScore}>
                      Overall Score: <Text style={{ fontWeight: 'bold' }}>{score.toFixed(1)}</Text>
                    </Text>
                    <Text style={styles.recommendationPrice}>
                      Price: ₱{product.price.toLocaleString()}
                    </Text>
                    {index === 0 && (
                      <View style={styles.bestChoiceBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                        <Text style={styles.bestChoiceText}>Best Choice</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
              
              {/* Performance vs Price Analysis */}
              <View style={styles.analysisSection}>
                <Text style={styles.analysisTitle}>Analysis:</Text>
                {productScores[0] && (
                  <Text style={styles.analysisText}>
                    {productScores[0].product.name.split(' ')[0]} offers the best overall performance. 
                    {productScores[productScores.length - 1].product.name.split(' ')[0]} has the best price-to-performance ratio.
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Comparison Table */}
          {canCompare && comparisonResults.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              <View style={styles.comparisonContainer}>
                {/* Spec Names Column */}
                <View style={[
                  styles.specNamesColumn,
                  { backgroundColor: COLORS.surface }
                ]}>
                  <View style={[
                    styles.specNameHeader,
                    { borderBottomColor: COLORS.border }
                  ]}>
                    <Text style={[
                      styles.specsTitle,
                      { color: COLORS.secondary }
                    ]}>SPECIFICATIONS</Text>
                  </View>
                  {comparisonResults.map(({ spec, analysis }) => (
                    <View 
                      key={spec} 
                      style={[
                        styles.specNameRow,
                        { borderBottomColor: COLORS.border + '50' }
                      ]}
                    >
                      <Text style={styles.specNameText}>{spec}</Text>
                      {analysis && (
                        <Text style={styles.specAnalysisText}>{analysis}</Text>
                      )}
                    </View>
                  ))}
                </View>

                {/* Product Columns */}
                <View style={styles.productsColumns}>
                  {products.map(renderProductHeader)}
                </View>

                {/* Spec Values */}
                <ScrollView style={styles.specsScroll}>
                  {comparisonResults.map(({ spec, values }) => (
                    <View 
                      key={spec} 
                      style={[
                        styles.specRow,
                        { borderBottomColor: COLORS.border + '50' }
                      ]}
                    >
                      {values.map(({ productId, formattedValue, isBest, isWorst, description }) => {
                        return (
                          <View 
                            key={productId} 
                            style={[
                              styles.specValueCell,
                              { 
                                width: productWidth,
                                borderRightColor: COLORS.border + '50',
                                backgroundColor: isBest ? COLORS.success + '10' : 
                                              isWorst ? COLORS.danger + '10' : 
                                              COLORS.surfaceLight
                              },
                              isBest && styles.bestSpecValueCell,
                              isWorst && styles.worstSpecValueCell
                            ]}
                          >
                            <Text style={[
                              styles.specValueText,
                              isBest && { color: COLORS.success, fontWeight: 'bold' },
                              isWorst && { color: COLORS.danger }
                            ]}>
                              {formattedValue}
                            </Text>
                            
                            {/* Indicators */}
                            <View style={styles.indicators}>
                              {isBest && (
                                <View style={styles.bestIndicator}>
                                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                                </View>
                              )}
                              {isWorst && (
                                <View style={styles.worstIndicator}>
                                  <Ionicons name="close-circle" size={16} color={COLORS.danger} />
                                </View>
                              )}
                            </View>
                            
                            {/* Description */}
                            <Text style={styles.specDescription} numberOfLines={2}>
                              {description}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
          )}

          {/* Legend */}
          <View style={[
            styles.legendSection,
            { 
              backgroundColor: COLORS.surface,
              borderTopColor: COLORS.border 
            }
          ]}>
            <View style={styles.legendItem}>
              <View style={[
                styles.legendColor, 
                { 
                  backgroundColor: THEME.components.badge.primary.backgroundColor,
                  borderColor: THEME.components.badge.primary.borderColor
                }
              ]} />
              <Text style={styles.legendText}>Best Overall</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[
                styles.legendColor, 
                styles.bestSpecValueCell,
                { 
                  backgroundColor: COLORS.success + '10',
                  borderColor: COLORS.success
                }
              ]} />
              <Text style={styles.legendText}>Best in Spec (✓)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[
                styles.legendColor, 
                styles.worstSpecValueCell,
                { 
                  backgroundColor: COLORS.danger + '10',
                  borderColor: COLORS.danger
                }
              ]} />
              <Text style={styles.legendText}>Worst in Spec (✗)</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={[
            styles.footer,
            { 
              backgroundColor: COLORS.background,
              borderTopColor: COLORS.border 
            }
          ]}>
            <TouchableOpacity 
              style={styles.closeFooterButton}
              onPress={onClose}
            >
              <View style={[
                styles.closeFooterButtonInner,
                { 
                  backgroundColor: THEME.components.button.secondary.backgroundColor,
                  borderColor: THEME.components.button.secondary.borderColor
                }
              ]}>
                <Ionicons name="close" size={20} color={THEME.components.button.secondary.textColor} />
                <Text style={[
                  styles.closeFooterButtonText,
                  { color: THEME.components.button.secondary.textColor }
                ]}>CLOSE</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 40,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  modalTitle: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  modalSubtitle: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.warning + '20',
    gap: 4,
  },
  warningText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.warning,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    gap: SPACING.sm,
  },
  warningMessage: {
    flex: 1,
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  recommendationsSection: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
  },
  recommendationsTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    marginBottom: SPACING.md,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  recommendationGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  recommendationCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  recommendationRank: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.primary,
  },
  recommendationName: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.primary,
    fontWeight: THEME.typography.fontWeights.semibold,
    flex: 1,
  },
  recommendationScore: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  recommendationPrice: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.text.tertiary,
  },
  bestChoiceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: 2,
  },
  bestChoiceText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.success,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  analysisSection: {
    marginTop: SPACING.sm,
  },
  analysisTitle: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.primary,
    fontWeight: THEME.typography.fontWeights.bold,
    marginBottom: 2,
  },
  analysisText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.secondary,
    lineHeight: THEME.typography.lineHeights.relaxed * THEME.typography.fontSizes.sm,
  },
  horizontalScroll: {
    flex: 1,
  },
  comparisonContainer: {
    paddingBottom: SPACING.lg,
  },
  specNamesColumn: {
    width: 120,
  },
  specsTitle: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wider,
  },
  specNameHeader: {
    height: 140,
    padding: SPACING.md,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  specNameRow: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    minHeight: 80,
  },
  specNameText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.secondary,
    fontWeight: THEME.typography.fontWeights.semibold,
    marginBottom: SPACING.xs,
  },
  specAnalysisText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
    lineHeight: THEME.typography.lineHeights.tight * THEME.typography.fontSizes.xs,
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
    ...SHADOWS.primary,
  },
  productHeader: {
    height: 140,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'space-between',
    position: 'relative',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bestBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    gap: 2,
    borderWidth: 1,
  },
  bestBadgeText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  productName: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  productPrice: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  productType: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.text.tertiary,
    fontWeight: THEME.typography.fontWeights.semibold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  scoreContainer: {
    marginTop: SPACING.xs,
  },
  scoreText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.success,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  pricePerfText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.secondary,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  removeButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
  },
  specsScroll: {
    marginTop: 140,
    marginLeft: 120,
  },
  specRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    minHeight: 80,
  },
  specValueCell: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRightWidth: 1,
    position: 'relative',
  },
  bestSpecValueCell: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.success,
  },
  worstSpecValueCell: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.danger,
  },
  specValueText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontWeight: THEME.typography.fontWeights.medium,
    marginBottom: SPACING.xs,
  },
  indicators: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
  },
  bestIndicator: {
    // Styles for checkmark indicator
  },
  worstIndicator: {
    // Styles for cross indicator
  },
  specDescription: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: THEME.typography.lineHeights.tight * THEME.typography.fontSizes.xs,
  },
  legendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.xl,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: BORDER_RADIUS.xs,
    borderWidth: 1,
  },
  legendText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.secondary,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
  },
  closeFooterButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeFooterButtonInner: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  closeFooterButtonText: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
});