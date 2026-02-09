import { allComponents } from '@/data/mockData';
import { useBuildStore } from '@/store/useBuildStore';
import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
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
  const slotType = params.slotType as string;
  
  const addPart = useBuildStore((state) => state.addPart);
  const getProductForSlot = (type: string) => {
    const store = useBuildStore.getState();
    switch (type) {
      case 'cpu': return store.cpu;
      case 'gpu': return store.gpu;
      case 'motherboard': return store.motherboard;
      case 'ram': return store.ram;
      case 'cooler': return store.cooler;
      case 'storage': return store.storage;
      case 'psu': return store.psu;
      case 'case': return store.case;
      default: return null;
    }
  };
  
  const component = allComponents.find(c => c.id === componentId);
  
  if (!component) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Component not found</Text>
      </View>
    );
  }

  // Check if this component is currently in the build
  const isInBuild = slotType ? getProductForSlot(slotType)?.id === componentId : false;

  const handleAddToBuild = () => {
    if (slotType) {
      addPart(slotType as any, component);
      Alert.alert(
        'Added to Build',
        `${component.name} has been added to your build.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              if (from === 'build') {
                router.back();
              }
            }
          },
          { 
            text: 'Go to Build', 
            onPress: () => {
              router.push('/(tabs)/build');
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Cannot Add',
        'Please select this component from the build screen to add it to your build.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleReplaceInBuild = () => {
    if (slotType) {
      addPart(slotType as any, component);
      Alert.alert(
        'Component Replaced',
        `${component.name} has replaced the current selection.`,
        [{ 
          text: 'OK',
          onPress: () => router.back()
        }]
      );
    }
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
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          
          <Text style={styles.title} numberOfLines={1}>
            {component.name}
          </Text>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Component Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            {component.image ? (
              <Image 
                source={{ uri: component.image }} 
                style={styles.componentImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                style={styles.imagePlaceholder}
              >
                <Text style={styles.imageText}>
                  {component.type.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
          </View>
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
            High-performance {component.type} for gaming and professional use with excellent specifications and reliability.
          </Text>
        </View>

        {/* Specifications */}
        <View style={styles.specsSection}>
          <View style={styles.specsHeader}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <Text style={styles.specsCount}>
              {Object.keys(component.specs).length} specs
            </Text>
          </View>
          
          {Object.entries(component.specs).map(([key, value]) => (
            <View key={key} style={styles.specRow}>
              <Text style={styles.specKey}>{key}:</Text>
              <Text style={styles.specValue}>{String(value)}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        {from !== 'build' && !isInBuild && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAddToBuild}
            >
              <LinearGradient
                colors={['#FF00FF', '#9400D3']}
                style={styles.buttonGradient}
              >
                <Ionicons name="add-circle" size={20} color="#FFF" />
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
                <Ionicons name="git-compare" size={18} color="#00FFFF" />
                <Text style={styles.secondaryButtonText}>
                  COMPARE
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* If component is already in build, show status message */}
        {from === 'build' && isInBuild && (
          <View style={styles.inBuildStatus}>
            <LinearGradient
              colors={['rgba(0, 255, 0, 0.1)', 'rgba(0, 128, 0, 0.05)']}
              style={styles.inBuildStatusGradient}
            >
              <View style={styles.inBuildStatusHeader}>
                <Ionicons name="checkmark-circle" size={32} color="#00FF00" />
                <Text style={styles.inBuildStatusTitle}>IN YOUR BUILD</Text>
              </View>
              
              <Text style={styles.inBuildStatusText}>
                This component is currently selected in your build
              </Text>
              
              <View style={styles.inBuildActions}>
                <TouchableOpacity
                  style={styles.backToBuildButton}
                  onPress={() => router.back()}
                >
                  <Text style={styles.backToBuildButtonText}>BACK TO BUILD</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.changeComponentButton}
                  onPress={() => {
                    // Navigate to component selection
                    router.push({
                      pathname: '/(tabs)/build',
                      params: { 
                        openModal: true,
                        slotType: slotType
                      }
                    });
                  }}
                >
                  <Ionicons name="swap-horizontal" size={14} color="#FF00FF" />
                  <Text style={styles.changeComponentButtonText}>CHANGE</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* If viewing from browse but component is in different slot */}
        {from !== 'build' && isInBuild && (
          <View style={styles.inBuildStatus}>
            <LinearGradient
              colors={['rgba(255, 0, 255, 0.1)', 'rgba(148, 0, 211, 0.05)']}
              style={styles.inBuildStatusGradient}
            >
              <View style={styles.inBuildStatusHeader}>
                <Ionicons name="information-circle" size={32} color="#FF00FF" />
                <Text style={styles.inBuildStatusTitle}>ALREADY IN BUILD</Text>
              </View>
              
              <Text style={styles.inBuildStatusText}>
                This component is already in your build
              </Text>
              
              <TouchableOpacity
                style={styles.viewBuildButton}
                onPress={() => router.push('/(tabs)/build')}
              >
                <Text style={styles.viewBuildButtonText}>VIEW BUILD</Text>
                <Ionicons name="arrow-forward" size={14} color="#00FFFF" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* If viewing from browse and can replace */}
        {from === 'build' && !isInBuild && slotType && (
          <View style={styles.replaceSection}>
            <LinearGradient
              colors={['rgba(0, 255, 255, 0.1)', 'rgba(0, 139, 139, 0.05)']}
              style={styles.replaceSectionGradient}
            >
              <View style={styles.replaceHeader}>
                <Ionicons name="swap-horizontal" size={28} color="#00FFFF" />
                <Text style={styles.replaceTitle}>REPLACE COMPONENT</Text>
              </View>
              
              <Text style={styles.replaceText}>
                Replace the current {slotType} in your build with this one
              </Text>
              
              <TouchableOpacity
                style={styles.replaceButton}
                onPress={handleReplaceInBuild}
              >
                <LinearGradient
                  colors={['#00FFFF', '#008B8B']}
                  style={styles.replaceButtonGradient}
                >
                  <Ionicons name="refresh" size={18} color="#FFF" />
                  <Text style={styles.replaceButtonText}>REPLACE IN BUILD</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerRight: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  imageWrapper: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  componentImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    fontSize: 48,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
  },
  infoSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  priceStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF00FF',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  componentType: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  specsSection: {
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    margin: spacing.md,
    marginTop: 0,
  },
  specsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  specsCount: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  specKey: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    flex: 1,
  },
  specValue: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    paddingLeft: spacing.sm,
  },
  actionButtons: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  secondaryButtonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#00FFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  inBuildStatus: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  inBuildStatusGradient: {
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.2)',
  },
  inBuildStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  inBuildStatusTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00FF00',
    letterSpacing: 1,
  },
  inBuildStatusText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  inBuildActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  backToBuildButton: {
    flex: 2,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.2)',
  },
  backToBuildButtonText: {
    color: '#FF00FF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  changeComponentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  changeComponentButtonText: {
    color: '#00FFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  viewBuildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.2)',
  },
  viewBuildButtonText: {
    color: '#FF00FF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  replaceSection: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  replaceSectionGradient: {
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  replaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  replaceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00FFFF',
    letterSpacing: 1,
  },
  replaceText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  replaceButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  replaceButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: 8,
  },
  replaceButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});