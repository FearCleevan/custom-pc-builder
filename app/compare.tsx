import { CompareModal } from '@/components/CompareModal';
import { useCompareStore } from '@/store/useCompareStore';
import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CompareScreen() {
  const router = useRouter();
  const compareProducts = useCompareStore((state) => state.products);
  const clearProducts = useCompareStore((state) => state.clearProducts);
  const removeProduct = useCompareStore((state) => state.removeProduct);
  
  const [showCompareModal, setShowCompareModal] = React.useState(false);

  // If no products to compare, show empty state
  if (compareProducts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={['#0a0a0f', '#1a1a2e']}
          style={styles.emptyHeader}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.emptyTitle}>Compare</Text>
          <View style={styles.headerRight} />
        </LinearGradient>

        <View style={styles.emptyContent}>
          <View style={styles.emptyIcon}>
            <Ionicons name="git-compare" size={64} color="#666" />
          </View>
          <Text style={styles.emptyTitleText}>Nothing to Compare</Text>
          <Text style={styles.emptySubtitle}>
            Add components to compare from the Explore page
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <LinearGradient
              colors={['#FF00FF', '#9400D3']}
              style={styles.browseButtonGradient}
            >
              <Ionicons name="search" size={20} color="#FFF" />
              <Text style={styles.browseButtonText}>BROWSE COMPONENTS</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#000000', '#1a1a2e']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Compare Components</Text>
            <Text style={styles.subtitle}>
              {compareProducts.length} {compareProducts.length === 1 ? 'component' : 'components'} selected
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.clearAllButton}
            onPress={clearProducts}
          >
            <Ionicons name="trash" size={20} color="#FF0000" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Ionicons name="cube" size={20} color="#FF00FF" />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{compareProducts.length}</Text>
            <Text style={styles.statLabel}>Components</Text>
          </View>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.stat}>
          <Ionicons name="pricetag" size={20} color="#00FFFF" />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>
              ₱{compareProducts.reduce((sum, product) => sum + product.price, 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Value</Text>
          </View>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.stat}>
          <Ionicons name="layers" size={20} color="#00FF00" />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>
              {new Set(compareProducts.map(p => p.type)).size}
            </Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>
      </View>

      {/* Selected Components */}
      <View style={styles.selectedSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SELECTED COMPONENTS</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.addMoreText}>Add More</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.componentsScroll}
          contentContainerStyle={styles.componentsContainer}
        >
          {compareProducts.map((product) => (
            <View key={product.id} style={styles.componentPreview}>
              <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.previewGradient}
              >
                {/* Remove Button */}
                <TouchableOpacity
                  style={styles.previewRemoveButton}
                  onPress={() => removeProduct(product.id)}
                >
                  <Ionicons name="close-circle" size={20} color="#FF0000" />
                </TouchableOpacity>
                
                {/* Component Type */}
                <Text style={styles.previewType}>
                  {product.type.toUpperCase()}
                </Text>
                
                {/* Component Name */}
                <Text style={styles.previewName} numberOfLines={2}>
                  {product.name}
                </Text>
                
                {/* Price */}
                <Text style={styles.previewPrice}>
                  ₱{product.price.toLocaleString()}
                </Text>
                
                {/* Quick Specs */}
                <View style={styles.previewSpecs}>
                  {Object.entries(product.specs)
                    .slice(0, 2)
                    .map(([key, value], index) => (
                      <Text key={index} style={styles.previewSpecText} numberOfLines={1}>
                        {key}: {String(value)}
                      </Text>
                    ))}
                </View>
                
                {/* Stock Status */}
                <View style={[
                  styles.previewStock,
                  { backgroundColor: product.stock === 'In stock' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)' }
                ]}>
                  <View style={[
                    styles.previewStockDot,
                    { backgroundColor: product.stock === 'In stock' ? '#00FF00' : '#FF0000' }
                  ]} />
                  <Text style={[
                    styles.previewStockText,
                    { color: product.stock === 'In stock' ? '#00FF00' : '#FF0000' }
                  ]}>
                    {product.stock}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          ))}
          
          {/* Add More Card */}
          <TouchableOpacity 
            style={styles.addMoreCard}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
              style={styles.addMoreGradient}
            >
              <Ionicons name="add-circle" size={32} color="#00FFFF" />
              <Text style={styles.addMoreCardText}>Add More</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Compare Button */}
      <View style={styles.compareActions}>
        <TouchableOpacity 
          style={styles.compareButton}
          onPress={() => setShowCompareModal(true)}
        >
          <LinearGradient
            colors={['#FF00FF', '#9400D3']}
            style={styles.compareButtonGradient}
          >
            <Ionicons name="git-compare" size={24} color="#FFF" />
            <Text style={styles.compareButtonText}>
              COMPARE NOW ({compareProducts.length})
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.compareHint}>
          Compare up to 4 components side by side
        </Text>
      </View>

      {/* Compare Modal */}
      <CompareModal
        visible={showCompareModal}
        onClose={() => setShowCompareModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  emptyHeader: {
    paddingTop: 60,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing.sm,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  headerRight: {
    width: 40,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    marginBottom: spacing.xl,
  },
  emptyTitleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  browseButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 300,
  },
  browseButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxl + 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 4,
  },
  clearAllButton: {
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.lg,
    margin: spacing.lg,
    marginTop: 0,
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: spacing.md,
  },
  selectedSection: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
  },
  addMoreText: {
    fontSize: 14,
    color: '#00FFFF',
    fontWeight: '600',
  },
  componentsScroll: {
    marginHorizontal: -spacing.lg,
  },
  componentsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  componentPreview: {
    width: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewGradient: {
    padding: spacing.lg,
    height: 200,
    position: 'relative',
  },
  previewRemoveButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  previewType: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  previewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  previewPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF00FF',
    marginBottom: spacing.sm,
  },
  previewSpecs: {
    marginBottom: spacing.sm,
    gap: 2,
  },
  previewSpecText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  previewStock: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  previewStockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  previewStockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addMoreCard: {
    width: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addMoreGradient: {
    padding: spacing.lg,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreCardText: {
    color: '#00FFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.sm,
    letterSpacing: 1,
  },
  compareActions: {
    padding: spacing.lg,
    paddingTop: 0,
    alignItems: 'center',
  },
  compareButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    marginBottom: spacing.sm,
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  compareButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  compareButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  compareHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});