import { CompareModal } from '@/components/CompareModal';
import { useCompareStore } from '@/store/useCompareStore';
import { THEME } from '@/theme/indexs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { colors: COLORS, spacing: SPACING, borderRadius: BORDER_RADIUS, shadows: SHADOWS } = THEME;

export default function TabsLayout() {
  const [showCompareModal, setShowCompareModal] = useState(false);
  const compareProducts = useCompareStore((state) => state.products);

  const renderHeader = () => (
    <LinearGradient
      colors={THEME.colors.gradients.dark}
      style={styles.headerGradient}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={[styles.logoWrapper, { 
          backgroundColor: THEME.components.badge.primary.backgroundColor,
          borderColor: THEME.components.badge.primary.borderColor 
        }]}>
          <Text style={styles.logoText}>PC</Text>
        </View>
        <View style={styles.logoTextContainer}>
          <Text style={styles.logoMainText}>NEXUS</Text>
          <Text style={styles.logoSubText}>BUILD</Text>
        </View>
      </View>

      {/* Header Icons */}
      <View style={styles.headerIcons}>
        {/* Compare Icon */}
        {compareProducts.length > 0 && (
          <TouchableOpacity
            style={styles.compareIconContainer}
            onPress={() => setShowCompareModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="git-compare" size={20} color={COLORS.secondary} />
            <View style={[
              styles.compareBadge, 
              { 
                backgroundColor: THEME.components.badge.secondary.backgroundColor,
                borderColor: THEME.components.badge.secondary.borderColor 
              }
            ]}>
              <Text style={[
                styles.compareBadgeText,
                { color: THEME.components.badge.secondary.textColor }
              ]}>
                {compareProducts.length}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Cart Icon */}
        <TouchableOpacity style={styles.cartIconContainer} activeOpacity={0.8}>
          <Ionicons name="cart" size={20} color={COLORS.primary} />
          <View style={[
            styles.cartBadge, 
            { 
              backgroundColor: THEME.components.badge.primary.backgroundColor,
              borderColor: THEME.components.badge.primary.borderColor 
            }
          ]}>
            <Text style={[
              styles.cartBadgeText,
              { color: THEME.components.badge.primary.textColor }
            ]}>3</Text>
          </View>
        </TouchableOpacity>

        {/* Notification Icon */}
        <TouchableOpacity style={styles.notifIconContainer} activeOpacity={0.8}>
          <Ionicons name="notifications" size={20} color={COLORS.success} />
          <View style={[
            styles.notifBadge, 
            { 
              backgroundColor: THEME.components.badge.success.backgroundColor,
              borderColor: THEME.components.badge.success.borderColor 
            }
          ]}>
            <Text style={[
              styles.notifBadgeText,
              { color: THEME.components.badge.success.textColor }
            ]}>5</Text>
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.text.tertiary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          header: () => renderHeader(),
          headerTitleAlign: 'left',
          tabBarBackground: () => (
            <LinearGradient
              colors={[COLORS.background, COLORS.surface]}
              style={StyleSheet.absoluteFill}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons 
                  name={focused ? "home" : "home-outline"} 
                  size={size} 
                  color={color} 
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="build"
          options={{
            title: 'Build',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons 
                  name={focused ? "construct" : "construct-outline"} 
                  size={size} 
                  color={color} 
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons 
                  name={focused ? "search" : "search-outline"} 
                  size={size} 
                  color={color} 
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="user"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons 
                  name={focused ? "person" : "person-outline"} 
                  size={size} 
                  color={color} 
                />
              </View>
            ),
          }}
        />
      </Tabs>

      <CompareModal
        visible={showCompareModal}
        onClose={() => setShowCompareModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // Header Styles
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + 10,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoWrapper: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  logoText: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.black,
    color: COLORS.text.primary,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  logoTextContainer: {
    marginLeft: SPACING.xs,
  },
  logoMainText: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.black,
    color: COLORS.text.primary,
    letterSpacing: THEME.typography.letterSpacing.wider,
  },
  logoSubText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: COLORS.text.secondary,
    letterSpacing: THEME.typography.letterSpacing.wider,
    marginTop: -SPACING.xs,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  // Icon Containers
  compareIconContainer: {
    position: 'relative',
    padding: SPACING.xs,
  },
  cartIconContainer: {
    position: 'relative',
    padding: SPACING.xs,
  },
  notifIconContainer: {
    position: 'relative',
    padding: SPACING.xs,
  },
  // Badges
  compareBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  compareBadgeText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.black,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cartBadgeText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.black,
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  notifBadgeText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.black,
  },
  // Tab Bar Styles
  tabBar: {
    backgroundColor: COLORS.background + 'F0',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 80,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.sm,
    position: 'absolute',
    ...SHADOWS.md,
  },
  tabBarLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.semibold,
    marginTop: SPACING.xs,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
});