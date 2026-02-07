import { allComponents } from '@/data/mockData';
import { useBuildStore } from '@/store/useBuildStore';
import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ComponentDetailsModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const componentId = params.id as string;
  const from = params.from as string;
  
  const addPart = useBuildStore((state) => state.addPart);
  
  const component = allComponents.find(c => c.id === componentId);
  
  if (!component) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Component not found</Text>
      </View>
    );
  }

  const handleAddToBuild = () => {
    addPart(component);
    Alert.alert(
      'Added to Build',
      `${component.name} has been added to your build.`,
      [
        { text: 'OK', onPress: () => {
          if (from === 'build') {
            router.back();
          }
        }},
        { text: 'Go to Build', onPress: () => {
          router.push('/(tabs)/build');
        }}
      ]
    );
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
          
          <Text style={styles.title} numberOfLines={1}>
            {component.name}
          </Text>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Component Image */}
        <View style={styles.imageContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.imagePlaceholder}
          >
            <Text style={styles.imageText}>
              {component.type.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        </View>

        {/* Component Info */}
        <View style={styles.infoSection}>
          <View style={styles.priceStockRow}>
            <Text style={styles.price}>
              ₱{component.price.toLocaleString()}
            </Text>
            <View style={[
              styles.stockBadge,
              { backgroundColor: component.stock === 'In stock' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)' }
            ]}>
              <View style={[
                styles.stockDot,
                { backgroundColor: component.stock === 'In stock' ? '#00FF00' : '#FF0000' }
              ]} />
              <Text style={[
                styles.stockText,
                { color: component.stock === 'In stock' ? '#00FF00' : '#FF0000' }
              ]}>
                {component.stock}
              </Text>
            </View>
          </View>

          <Text style={styles.componentType}>
            {component.type.toUpperCase()}
          </Text>

          <Text style={styles.description}>
            High-performance {component.type} for gaming and professional use.
          </Text>
        </View>

        {/* Specifications */}
        <View style={styles.specsSection}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          
          {Object.entries(component.specs).map(([key, value]) => (
            <View key={key} style={styles.specRow}>
              <Text style={styles.specKey}>{key}:</Text>
              <Text style={styles.specValue}>{String(value)}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleAddToBuild}
          >
            <LinearGradient
              colors={['#FF00FF', '#9400D3']}
              style={styles.buttonGradient}
            >
              <Ionicons name="add-circle" size={24} color="#FFF" />
              <Text style={styles.primaryButtonText}>
                ADD TO BUILD
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              // Handle compare
            }}
          >
            <LinearGradient
              colors={['rgba(0, 255, 255, 0.1)', 'rgba(0, 255, 255, 0.05)']}
              style={styles.secondaryButtonGradient}
            >
              <Ionicons name="git-compare" size={20} color="#00FFFF" />
              <Text style={styles.secondaryButtonText}>
                COMPARE
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    fontSize: 64,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
  },
  infoSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  priceStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF00FF',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
  },
  componentType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
  },
  specsSection: {
    padding: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    margin: spacing.lg,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: spacing.lg,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  specKey: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
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