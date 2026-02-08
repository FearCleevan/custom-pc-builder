import { allComponents, prebuiltSeries } from '@/data/mockData';
import { useBuildStore } from '@/store/useBuildStore';
import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;

const SERIES_CATEGORIES = [
  { id: 'gaming', name: 'Gaming PC Build', icon: 'game-controller' },
  { id: 'workstation', name: 'Workstation Build', icon: 'desktop' },
  { id: 'industrial', name: 'Industrial Build', icon: 'build' },
  { id: 'all', name: 'All Series', icon: 'grid' },
];

const getSeriesByCategory = (category: string) => {
  const seriesArray = Object.values(prebuiltSeries);
  
  if (category === 'all') return seriesArray;
  
  return seriesArray.filter(series => {
    if (category === 'gaming') {
      return series.id === 'vision' || series.id === 'aegis' || series.id === 'infinite';
    } else if (category === 'workstation') {
      return series.id === 'codex';
    } else if (category === 'industrial') {
      return series.id === 'industrial';
    }
    return true;
  });
};

export default function PrebuiltSeriesScreen() {
  const router = useRouter();
  const clearBuild = useBuildStore((state) => state.clearBuild);
  const addPart = useBuildStore((state) => state.addPart);
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);

  const seriesList = getSeriesByCategory(selectedCategory);

  const handleCustomizeBuild = (seriesId: string) => {
    const series = prebuiltSeries[seriesId as keyof typeof prebuiltSeries];
    if (!series || !series.components) return;

    // Clear existing build
    clearBuild();
    
    // Load series components
    Object.entries(series.components).forEach(([type, componentId]) => {
      const component = allComponents.find(c => c.id === componentId);
      if (component) {
        addPart(component);
      }
    });
    
    // Navigate to build screen
    router.push('/(tabs)/build');
  };

  const handleExpandSeries = (seriesId: string) => {
    setExpandedSeries(expandedSeries === seriesId ? null : seriesId);
  };

  const renderSeriesCard = ({ item }: { item: any }) => {
    const isExpanded = expandedSeries === item.id;
    
    // Get actual components for display
    const components = Object.entries(item.components || {}).map(([type, componentId]) => {
      return allComponents.find(c => c.id === componentId);
    }).filter(Boolean);

    return (
      <View key={item.id} style={styles.seriesCard}>
        <LinearGradient
          colors={item.gradient || ['#FF00FF', '#9400D3']}
          style={styles.seriesCardHeader}
        >
          <View style={styles.seriesHeaderContent}>
            <View>
              <Text style={styles.seriesName}>{item.name}</Text>
              <Text style={styles.seriesDescription}>{item.description}</Text>
            </View>
            <View style={styles.seriesBadge}>
              <Text style={styles.seriesPrice}>${item.price}</Text>
            </View>
          </View>
          
          <Text style={styles.seriesSpecs}>{item.specs}</Text>
          
          <View style={styles.seriesActions}>
            <TouchableOpacity 
              style={styles.viewComponentsButton}
              onPress={() => handleExpandSeries(item.id)}
            >
              <Text style={styles.viewComponentsText}>
                {isExpanded ? 'HIDE COMPONENTS' : 'VIEW COMPONENTS'}
              </Text>
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#FFF" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.customizeButton}
              onPress={() => handleCustomizeBuild(item.id)}
            >
              <LinearGradient
                colors={['#00FFFF', '#008B8B']}
                style={styles.customizeButtonGradient}
              >
                <Ionicons name="build" size={18} color="#FFF" />
                <Text style={styles.customizeButtonText}>CUSTOMIZE BUILD</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {isExpanded && components.length > 0 && (
          <View style={styles.componentsList}>
            <Text style={styles.componentsTitle}>INCLUDED COMPONENTS</Text>
            
            {components.map((component, index) => (
              component && (
                <View key={index} style={styles.componentRow}>
                  <View style={styles.componentInfo}>
                    <View style={[
                      styles.componentTypeBadge,
                      { backgroundColor: component.stock === 'In stock' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)' }
                    ]}>
                      <Text style={styles.componentTypeText}>
                        {component.type.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.componentName} numberOfLines={1}>
                      {component.name}
                    </Text>
                  </View>
                  
                  <View style={styles.componentDetails}>
                    <Text style={styles.componentPrice}>
                      ₱{component.price.toLocaleString()}
                    </Text>
                    <View style={[
                      styles.stockIndicator,
                      { backgroundColor: component.stock === 'In stock' ? '#00FF00' : '#FF0000' }
                    ]} />
                  </View>
                </View>
              )
            ))}
          </View>
        )}
      </View>
    );
  };

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
          
          <Text style={styles.title}>Pre-Built Series</Text>
          
          <View style={styles.placeholder} />
        </View>
        
        <Text style={styles.subtitle}>
          Professionally curated builds for every need
        </Text>
      </LinearGradient>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {SERIES_CATEGORIES.map(category => (
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

      {/* Series List */}
      <FlatList
        data={seriesList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.seriesList}
        showsVerticalScrollIndicator={false}
        renderItem={renderSeriesCard}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color="#666" />
            <Text style={styles.emptyStateText}>
              No series found
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Try selecting a different category
            </Text>
          </View>
        }
      />

      {/* Quick Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{seriesList.length}</Text>
          <Text style={styles.statLabel}>Series</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ${Math.min(...seriesList.map(s => s.price))}
          </Text>
          <Text style={styles.statLabel}>Starting Price</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>100%</Text>
          <Text style={styles.statLabel}>Compatible</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.xxl + 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(255, 0, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  categoryTabs: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryTabsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
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
  seriesList: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 80,
  },
  seriesCard: {
    width: CARD_WIDTH,
    marginBottom: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  seriesCardHeader: {
    padding: spacing.lg,
  },
  seriesHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  seriesName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: spacing.xs,
  },
  seriesDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  seriesBadge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  seriesPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
  },
  seriesSpecs: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.lg,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  seriesActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  viewComponentsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  viewComponentsText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
    letterSpacing: 1,
  },
  customizeButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  customizeButtonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  customizeButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  componentsList: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  componentsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00FFFF',
    marginBottom: spacing.lg,
    letterSpacing: 2,
  },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  componentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  componentTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  componentTypeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  componentName: {
    fontSize: 12,
    color: '#FFF',
    flex: 1,
  },
  componentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  componentPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF00FF',
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
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
  },
  statsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 10, 15, 0.9)',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF00FF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});