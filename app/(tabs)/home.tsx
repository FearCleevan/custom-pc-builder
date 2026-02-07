import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Gaming PC categories
const GAMING_PC_CATEGORIES = [
  {
    id: 'vision',
    name: 'VISION SERIES',
    description: '4K Gaming & Streaming',
    fps: '240+ FPS',
    price: '$3,499',
    color: '#FF00FF',
    gradient: ['#FF00FF', '#9400D3'] as const,
    specs: 'RTX 4090 | i9-14900K | 64GB DDR5'
  },
  {
    id: 'infinite',
    name: 'INFINITE SERIES',
    description: 'Ultra Performance',
    fps: '360+ FPS',
    price: '$4,999',
    color: '#00FFFF',
    gradient: ['#00FFFF', '#008B8B'] as const,
    specs: 'RTX 4090 Ti | Ryzen 9 7950X3D | 128GB DDR5'
  },
  {
    id: 'aegis',
    name: 'AEGIS SERIES',
    description: 'Competitive Esports',
    fps: '500+ FPS',
    price: '$2,799',
    color: '#00FF00',
    gradient: ['#00FF00', '#006400'] as const,
    specs: 'RTX 4080 Super | i7-14700K | 32GB DDR5'
  },
  {
    id: 'codex',
    name: 'CODEX SERIES',
    description: 'AI & Content Creation',
    fps: '165+ FPS',
    price: '$3,999',
    color: '#FFFF00',
    gradient: ['#FFFF00', '#FF8C00'] as const,
    specs: 'RTX 4090 | Threadripper | 128GB DDR5'
  }
];

// Gaming PC Card
const GamingPCCard = ({ category, onPress }: { category: typeof GAMING_PC_CATEGORIES[0]; onPress: () => void }) => {
  return (
    <TouchableOpacity
      style={styles.gamingCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={category.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gamingCardGradient}
      >
        {/* Glow effect */}
        <View style={[styles.cardGlow, { backgroundColor: category.color }]} />

        <View style={styles.gamingCardContent}>
          <View style={styles.gamingCardHeader}>
            <Text style={styles.gamingCardName}>{category.name}</Text>
            <View style={[styles.fpsBadge, { backgroundColor: `${category.color}40` }]}>
              <Text style={[styles.fpsText, { color: category.color }]}>
                {category.fps}
              </Text>
            </View>
          </View>

          <Text style={styles.gamingCardDescription}>
            {category.description}
          </Text>

          <Text style={styles.gamingCardSpecs}>
            {category.specs}
          </Text>

          <View style={styles.gamingCardFooter}>
            <Text style={styles.gamingCardPrice}>
              {category.price}
            </Text>
            <View style={[styles.exploreButton, { backgroundColor: `${category.color}40` }]}>
              <Text style={[styles.exploreButtonText, { color: category.color }]}>
                EXPLORE
              </Text>
              <Ionicons name="arrow-forward" size={16} color={category.color} />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const scrollY = useSharedValue(0);

  const handleStartBuilding = () => {
    router.push('/(tabs)/build');
  };

  const handleQuickStart = (categoryId) => {
    // For now, just navigate to build with a parameter
    router.push({
      pathname: '/(tabs)/build',
      params: { preset: categoryId }
    });
  };

  const handleCustomBuild = () => {
    router.push('/(tabs)/build');
  };

  const handleBrowseAll = () => {
    router.push('/(tabs)/explore');
  };

  const bannerAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, 100],
      [1, 1.05],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }]
    };
  });

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      onScroll={(event) => {
        scrollY.value = event.nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}
    >
      {/* Hero Banner */}
      <Animated.View style={[styles.heroBanner, bannerAnimatedStyle]}>
        <LinearGradient
          colors={['#000000', '#1a1a2e', '#16213e']}
          style={styles.heroGradient}
        >
          {/* Neon Grid Overlay */}
          <View style={styles.neonGrid} />

          {/* Hero Content */}
          <View style={styles.heroContent}>
            <View style={styles.badgeContainer}>
              <LinearGradient
                colors={['#FF00FF', '#9400D3']}
                style={styles.badge}
              >
                <Text style={styles.badgeText}>NEW GENERATION</Text>
              </LinearGradient>
            </View>

            <Text style={styles.heroTitle}>
              BUILD YOUR{"\n"}
              <Text style={styles.heroTitleHighlight}>ULTIMATE</Text>
              {"\n"}GAMING RIG
            </Text>

            <Text style={styles.heroSubtitle}>
              Customize every component. Maximize every frame.
              {"\n"}Experience the future of PC building.
            </Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>240+</Text>
                <Text style={styles.statLabel}>FPS GUARANTEED</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>100%</Text>
                <Text style={styles.statLabel}>COMPATIBILITY</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>24/7</Text>
                <Text style={styles.statLabel}>EXPERT SUPPORT</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartBuilding}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF00FF', '#9400D3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>
                <Ionicons name="construct" size={24} color="#FFF" />
                {"  "}
                START BUILDING
              </Text>
              <View style={styles.buttonGlow} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBrowseAll}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.secondaryButtonGradient}
            >
              <Text style={styles.secondaryButtonText}>
                <Ionicons name="grid" size={20} color="#00FFFF" />
                {"  "}
                BROWSE ALL COMPONENTS
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Quick Start Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={['#FF00FF', '#00FFFF']}
            style={styles.sectionTitleGradient}
          >
            <Text style={styles.sectionTitle}>QUICK START</Text>
          </LinearGradient>
          <Text style={styles.sectionSubtitle}>
            Browse our curated gaming PC builds
          </Text>
        </View>

        {/* Gaming PC Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {GAMING_PC_CATEGORIES.map((category) => (
            <GamingPCCard
              key={category.id}
              category={category}
              onPress={() => handleQuickStart(category.id)}
            />
          ))}

          {/* Build Your Own Card */}
          <TouchableOpacity
            style={styles.buildYourOwnCard}
            onPress={handleCustomBuild}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.buildYourOwnGradient}
            >
              <View style={styles.buildYourOwnIcon}>
                <Ionicons name="add-circle" size={64} color="#00FFFF" />
                <View style={styles.buildYourOwnGlow} />
              </View>
              <Text style={styles.buildYourOwnTitle}>
                BUILD-YOUR-OWN
              </Text>
              <Text style={styles.buildYourOwnDescription}>
                Start from scratch with our{"\n"}advanced configurator
              </Text>
              <View style={styles.buildYourOwnButton}>
                <Text style={styles.buildYourOwnButtonText}>
                  START CUSTOM
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Industrial PC Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={['#00FFFF', '#00FF00']}
            style={styles.sectionTitleGradient}
          >
            <Text style={styles.sectionTitle}>INDUSTRIAL PC</Text>
          </LinearGradient>
          <Text style={styles.sectionSubtitle}>
            High-performance workstations for professionals
          </Text>
        </View>

        <TouchableOpacity
          style={styles.industrialCard}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(0, 255, 255, 0.1)', 'rgba(0, 255, 255, 0.05)']}
            style={styles.industrialGradient}
          >
            <View style={styles.industrialContent}>
              <View style={styles.industrialBadge}>
                <Text style={styles.industrialBadgeText}>ENTERPRISE</Text>
              </View>
              <Text style={styles.industrialTitle}>
                RENDER & SIMULATION WORKSTATIONS
              </Text>
              <Text style={styles.industrialDescription}>
                Dual RTX 6000 Ada | Threadripper Pro | 256GB ECC RAM{"\n"}
                Built for 3D rendering, AI training, and scientific computing
              </Text>
              <View style={styles.industrialSpecs}>
                <View style={styles.specItem}>
                  <Ionicons name="hardware-chip" size={20} color="#00FFFF" />
                  <Text style={styles.specText}>Dual GPU Support</Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="server" size={20} color="#00FFFF" />
                  <Text style={styles.specText}>ECC Memory</Text>
                </View>
                <View style={styles.specItem}>
                  <Ionicons name="shield-checkmark" size={20} color="#00FFFF" />
                  <Text style={styles.specText}>24/7 Reliability</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.industrialButton}>
                <Text style={styles.industrialButtonText}>
                  EXPLORE INDUSTRIAL SOLUTIONS
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#00FFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <LinearGradient
          colors={['rgba(255, 0, 255, 0.1)', 'transparent']}
          style={styles.footerGradient}
        >
          <Text style={styles.footerTitle}>
            READY TO BUILD YOUR DREAM PC?
          </Text>
          <Text style={styles.footerSubtitle}>
            Join over 500,000 gamers who built their perfect rig with us
          </Text>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={handleStartBuilding}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF00FF', '#9400D3']}
              style={styles.footerButtonGradient}
            >
              <Text style={styles.footerButtonText}>
                START BUILDING NOW
              </Text>
              <Ionicons name="rocket" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  // Hero Banner
  heroBanner: {
    height: SCREEN_HEIGHT * 0.85,
    marginBottom: spacing.xl,
  },
  heroGradient: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'flex-end',
  },
  neonGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    opacity: 0.1,
    backgroundImage: `linear-gradient(rgba(255, 0, 255, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255, 0, 255, 0.1) 1px, transparent 1px)`,
    backgroundSize: '50px 50px',
  },
  heroContent: {
    marginBottom: spacing.xxl,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  badge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 52,
    marginBottom: spacing.md,
    textShadowColor: 'rgba(255, 0, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  heroTitleHighlight: {
    color: '#FF00FF',
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF00FF',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: spacing.md,
  },
  // CTA Buttons
  ctaContainer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    backgroundColor: '#FF00FF',
    opacity: 0.2,
    borderRadius: 100,
    // blurRadius: 50,
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
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondaryButtonText: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  // Sections
  section: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.xl,
  },
  sectionTitleGradient: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  // Gaming PC Cards
  categoriesScroll: {
    marginHorizontal: -spacing.lg,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  gamingCard: {
    width: 280,
    height: 320,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gamingCardGradient: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    opacity: 0.1,
    borderRadius: 100,
    // blurRadius: 50,
  },
  gamingCardContent: {
    flex: 1,
  },
  gamingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  gamingCardName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    flex: 1,
    letterSpacing: 1,
  },
  fpsBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fpsText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  gamingCardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.sm,
  },
  gamingCardSpecs: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.lg,
    lineHeight: 16,
  },
  gamingCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  gamingCardPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  exploreButtonText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  // Build Your Own Card
  buildYourOwnCard: {
    width: 280,
    height: 320,
    borderRadius: 20,
    overflow: 'hidden',
  },
  buildYourOwnGradient: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buildYourOwnIcon: {
    marginBottom: spacing.lg,
    position: 'relative',
  },
  buildYourOwnGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: '#00FFFF',
    opacity: 0.1,
    borderRadius: 100,
    // blurRadius: 20,
  },
  buildYourOwnTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  buildYourOwnDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 18,
  },
  buildYourOwnButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  buildYourOwnButtonText: {
    color: '#00FFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  // Industrial Card
  industrialCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  industrialGradient: {
    padding: spacing.xl,
  },
  industrialContent: {
    gap: spacing.lg,
  },
  industrialBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  industrialBadgeText: {
    color: '#00FFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  industrialTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 28,
  },
  industrialDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  industrialSpecs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginVertical: spacing.lg,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  specText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  industrialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 255, 0.2)',
  },
  industrialButtonText: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  // Footer
  footer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  footerGradient: {
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.2)',
  },
  footerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  footerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  footerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  footerButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
});