import { THEME } from '@/theme/indexs';
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

const { colors: COLORS, spacing: SPACING, borderRadius: BORDER_RADIUS, shadows: SHADOWS } = THEME;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Gaming PC categories
const GAMING_PC_CATEGORIES = [
  {
    id: 'vision',
    name: 'VISION SERIES',
    description: '4K Gaming & Streaming',
    fps: '240+ FPS',
    price: '$3,499',
    color: COLORS.primary,
    gradient: THEME.colors.gradients.primary as [string, string],
    specs: 'RTX 4090 | i9-14900K | 64GB DDR5'
  },
  {
    id: 'infinite',
    name: 'INFINITE SERIES',
    description: 'Ultra Performance',
    fps: '360+ FPS',
    price: '$4,999',
    color: COLORS.secondary,
    gradient: THEME.colors.gradients.secondary as [string, string],
    specs: 'RTX 4090 Ti | Ryzen 9 7950X3D | 128GB DDR5'
  },
  {
    id: 'aegis',
    name: 'AEGIS SERIES',
    description: 'Competitive Esports',
    fps: '500+ FPS',
    price: '$2,799',
    color: COLORS.success,
    gradient: THEME.colors.gradients.success as [string, string],
    specs: 'RTX 4080 Super | i7-14700K | 32GB DDR5'
  },
  {
    id: 'codex',
    name: 'CODEX SERIES',
    description: 'AI & Content Creation',
    fps: '165+ FPS',
    price: '$3,999',
    color: COLORS.warning,
    gradient: THEME.colors.gradients.warning as [string, string],
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
        <View style={styles.gamingCardContent}>
          <View style={styles.gamingCardHeader}>
            <Text style={styles.gamingCardName}>{category.name}</Text>
            <View style={[styles.fpsBadge, { backgroundColor: THEME.components.badge.primary.backgroundColor }]}>
              <Text style={[styles.fpsText, { color: THEME.components.badge.primary.textColor }]}>
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
            <View style={[styles.exploreButton, { backgroundColor: category.color + '20' }]}>
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

  const handleQuickStart = (categoryId: string) => {
    router.push({
      pathname: '/(modals)/series-details',
      params: {
        seriesId: categoryId,
        mode: 'quick-start'
      }
    });
  };

  const handleCustomBuild = () => {
    router.push('/(tabs)/build?mode=custom');
  };

  const handleBrowseAll = () => {
    router.push('/(tabs)/explore?view=all&category=all');
  };

  const handleIndustrialSolutions = () => {
    router.push({
      pathname: '/(modals)/series-details',
      params: {
        seriesId: 'industrial',
        mode: 'industrial'
      }
    });
  };

  const bannerAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, 100],
      [1, 1.02],
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
          colors={THEME.colors.gradients.dark}
          style={styles.heroGradient}
        >
          {/* Hero Content */}
          <View style={styles.heroContent}>
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>NEW GENERATION</Text>
              </View>
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
              colors={THEME.colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>
                <Ionicons name="construct" size={20} color="#FFF" />
                {"  "}
                START BUILDING
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBrowseAll}
            activeOpacity={0.8}
          >
            <View style={styles.secondaryButtonInner}>
              <Text style={styles.secondaryButtonText}>
                <Ionicons name="grid" size={18} color={COLORS.secondary} />
                {"  "}
                BROWSE ALL COMPONENTS
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Quick Start Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>QUICK START</Text>
          </View>
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
            <View style={styles.buildYourOwnInner}>
              <View style={styles.buildYourOwnIcon}>
                <Ionicons name="add-circle" size={48} color={COLORS.secondary} />
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
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Industrial PC Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>INDUSTRIAL PC</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            High-performance workstations for professionals
          </Text>
        </View>

        <TouchableOpacity
          style={styles.industrialCard}
          activeOpacity={0.8}
          onPress={handleIndustrialSolutions}
        >
          <View style={styles.industrialInner}>
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
                <Ionicons name="hardware-chip" size={20} color={COLORS.secondary} />
                <Text style={styles.specText}>Dual GPU Support</Text>
              </View>
              <View style={styles.specItem}>
                <Ionicons name="server" size={20} color={COLORS.secondary} />
                <Text style={styles.specText}>ECC Memory</Text>
              </View>
              <View style={styles.specItem}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
                <Text style={styles.specText}>24/7 Reliability</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.industrialButton}>
              <Text style={styles.industrialButtonText}>
                EXPLORE INDUSTRIAL SOLUTIONS
              </Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <View style={styles.footerInner}>
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
              colors={THEME.colors.gradients.primary}
              style={styles.footerButtonGradient}
            >
              <Text style={styles.footerButtonText}>
                START BUILDING NOW
              </Text>
              <Ionicons name="rocket" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Hero Banner
  heroBanner: {
    height: SCREEN_HEIGHT * 0.75,
    marginBottom: SPACING.xl,
  },
  heroGradient: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'flex-end',
  },
  heroContent: {
    marginBottom: SPACING.xl,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.lg,
  },
  badge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wider,
  },
  heroTitle: {
    fontSize: THEME.typography.fontSizes['5xl'],
    fontWeight: THEME.typography.fontWeights.black,
    color: COLORS.text.primary,
    lineHeight: 52,
    marginBottom: SPACING.md,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  heroTitleHighlight: {
    color: COLORS.primary,
  },
  heroSubtitle: {
    fontSize: THEME.typography.fontSizes.lg,
    color: COLORS.text.secondary,
    lineHeight: THEME.typography.lineHeights.relaxed * THEME.typography.fontSizes.lg,
    marginBottom: SPACING.xl,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: THEME.typography.fontSizes['3xl'],
    fontWeight: THEME.typography.fontWeights.black,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.text.tertiary,
    letterSpacing: THEME.typography.letterSpacing.wide,
    textAlign: "center",
    fontWeight: THEME.typography.fontWeights.medium,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  // CTA Buttons
  ctaContainer: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  primaryButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.primary,
  },
  buttonGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  secondaryButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonInner: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: THEME.components.button.secondary.backgroundColor,
  },
  secondaryButtonText: {
    color: COLORS.secondary,
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  // Sections
  section: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.lg,
  },
  sectionTitleContainer: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.primary,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  sectionSubtitle: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.text.secondary,
    fontWeight: THEME.typography.fontWeights.normal,
  },
  // Gaming PC Cards
  categoriesScroll: {
    marginHorizontal: -SPACING.lg,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.lg,
  },
  gamingCard: {
    width: 280,
    height: 280,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  gamingCardGradient: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  gamingCardContent: {
    flex: 1,
  },
  gamingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  gamingCardName: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.white,
    flex: 1,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  fpsBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fpsText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  gamingCardDescription: {
    fontSize: THEME.typography.fontSizes.md,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.sm,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  gamingCardSpecs: {
    fontSize: THEME.typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.lg,
    lineHeight: THEME.typography.lineHeights.normal * THEME.typography.fontSizes.sm,
  },
  gamingCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  gamingCardPrice: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.white,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  exploreButtonText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  // Build Your Own Card
  buildYourOwnCard: {
    width: 280,
    height: 280,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: THEME.components.card.default.backgroundColor,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  buildYourOwnInner: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buildYourOwnIcon: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.secondary + '15',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
  },
  buildYourOwnTitle: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  buildYourOwnDescription: {
    fontSize: THEME.typography.fontSizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: THEME.typography.lineHeights.normal * THEME.typography.fontSizes.sm,
  },
  buildYourOwnButton: {
    backgroundColor: THEME.components.button.outline.backgroundColor,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buildYourOwnButtonText: {
    color: COLORS.secondary,
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  // Industrial Card
  industrialCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: THEME.components.card.default.backgroundColor,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  industrialInner: {
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  industrialBadge: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.components.badge.secondary.backgroundColor,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: THEME.components.badge.secondary.borderColor,
  },
  industrialBadgeText: {
    color: THEME.components.badge.secondary.textColor,
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  industrialTitle: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    lineHeight: THEME.typography.lineHeights.tight * THEME.typography.fontSizes['2xl'],
  },
  industrialDescription: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.text.secondary,
    lineHeight: THEME.typography.lineHeights.relaxed * THEME.typography.fontSizes.md,
  },
  industrialSpecs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
    marginVertical: SPACING.lg,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  specText: {
    color: COLORS.text.secondary,
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  industrialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  industrialButtonText: {
    color: COLORS.secondary,
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  // Footer
  footer: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  footerInner: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  footerTitle: {
    fontSize: THEME.typography.fontSizes['3xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  footerSubtitle: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: THEME.typography.lineHeights.normal * THEME.typography.fontSizes.md,
  },
  footerButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    width: '100%',
    ...SHADOWS.primary,
  },
  footerButtonGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  footerButtonText: {
    color: COLORS.white,
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
});