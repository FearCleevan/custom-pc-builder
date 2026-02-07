import { allComponents, getPrebuiltSeries } from '@/data/mockData';
import { useBuildStore } from '@/store/useBuildStore';
import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SeriesDetailsModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const seriesId = params.seriesId as string;
  const mode = params.mode as string;
  
  const addPart = useBuildStore((state) => state.addPart);
  const clearBuild = useBuildStore((state) => state.clearBuild);
  
  const series = getPrebuiltSeries(seriesId);
  
  const [selectedComponents, setSelectedComponents] = useState<Record<string, string>>(
    series?.components || {}
  );

  if (!series) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Series not found</Text>
      </View>
    );
  }

  const handleComponentSelect = (componentType: string, componentId: string) => {
    setSelectedComponents(prev => ({
      ...prev,
      [componentType]: componentId
    }));
  };

  const handleLoadToBuilder = () => {
    // Clear existing build
    clearBuild();
    
    // Add all selected components to build
    Object.entries(selectedComponents).forEach(([type, id]) => {
      const component = allComponents.find(c => c.id === id);
      if (component) {
        addPart(component);
      }
    });
    
    // Navigate to build screen
    router.push('/(tabs)/build');
  };

  const handleCustomize = () => {
    router.push({
      pathname: '/(tabs)/build',
      params: { 
        series: seriesId,
        components: JSON.stringify(selectedComponents)
      }
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0f', '#1a1a2e']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <Text style={styles.seriesTitle}>{series.name}</Text>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Series Overview */}
        <View style={styles.overviewSection}>
          <LinearGradient
            colors={series.gradient}
            style={styles.overviewGradient}
          >
            <View style={styles.overviewContent}>
              <Text style={styles.overviewTitle}>{series.description}</Text>
              <Text style={styles.overviewSpecs}>{series.specs}</Text>
              
              {series.fps && (
                <View style={[styles.fpsBadge, { backgroundColor: `${series.color}40` }]}>
                  <Text style={[styles.fpsText, { color: series.color }]}>
                    {series.fps}
                  </Text>
                </View>
              )}
              
              <Text style={styles.overviewPrice}>
                Starting at ${series.price}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Components Selection */}
        <View style={styles.componentsSection}>
          <Text style={styles.sectionTitle}>Components</Text>
          <Text style={styles.sectionSubtitle}>
            Customize the components in your {series.name}
          </Text>
          
          {Object.entries(series.components).map(([type, componentId]) => {
            const component = allComponents.find(c => c.id === componentId);
            const alternatives = allComponents.filter(c => c.type === type);
            
            return (
              <View key={type} style={styles.componentCard}>
                <Text style={styles.componentType}>
                  {type.toUpperCase()}
                </Text>
                
                <TouchableOpacity 
                  style={styles.selectedComponent}
                  onPress={() => {
                    // Show component picker
                    Alert.alert(
                      `Select ${type}`,
                      'Choose a different component',
                      alternatives.map(alt => ({
                        text: alt.name,
                        onPress: () => handleComponentSelect(type, alt.id)
                      }))
                    );
                  }}
                >
                  <Text style={styles.componentName}>
                    {component?.name || 'Not selected'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
                
                {component && (
                  <View style={styles.componentDetails}>
                    <Text style={styles.componentPrice}>
                      ₱{component.price.toLocaleString()}
                    </Text>
                    <Text style={styles.componentStock}>
                      {component.stock}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLoadToBuilder}
          >
            <LinearGradient
              colors={series.gradient}
              style={styles.buttonGradient}
            >
              <Ionicons name="construct" size={24} color="#FFF" />
              <Text style={styles.primaryButtonText}>
                LOAD TO BUILDER
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCustomize}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.secondaryButtonGradient}
            >
              <Ionicons name="options" size={20} color="#00FFFF" />
              <Text style={styles.secondaryButtonText}>
                CUSTOMIZE FURTHER
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  headerGradient: {
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  seriesTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  overviewSection: {
    margin: spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
  },
  overviewGradient: {
    padding: spacing.xl,
  },
  overviewContent: {
    alignItems: 'center',
  },
  overviewTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  overviewSpecs: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  fpsBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },
  fpsText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  overviewPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
  },
  componentsSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.xl,
  },
  componentCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  componentType: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  selectedComponent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  componentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  componentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  componentPrice: {
    fontSize: 14,
    color: '#FF00FF',
    fontWeight: '700',
  },
  componentStock: {
    fontSize: 12,
    color: '#00FF00',
    fontWeight: '600',
  },
  actionButtons: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  secondaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  secondaryButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  secondaryButtonText: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  errorText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});