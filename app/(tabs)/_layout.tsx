import { CompareModal } from '@/components/CompareModal';
import { useCompareStore } from '@/store/useCompareStore';
import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TabsLayout() {
  const [showCompareModal, setShowCompareModal] = useState(false);
  const compareProducts = useCompareStore((state) => state.products);

  const renderHeader = () => (
    <LinearGradient
      colors={['#0a0a0f', '#1a1a2e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.headerGradient}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <LinearGradient
          colors={['#FF00FF', '#9400D3']}
          style={styles.logoGradient}
        >
          <Text style={styles.logoText}>PC</Text>
          <View style={styles.logoGlow} />
        </LinearGradient>
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
            <Ionicons name="git-compare" size={20} color="#00FFFF" />
            {compareProducts.length > 0 && (
              <View style={styles.compareBadge}>
                <Text style={styles.compareBadgeText}>
                  {compareProducts.length}
                </Text>
              </View>
            )}
            <View style={styles.iconGlow} />
          </TouchableOpacity>
        )}

        {/* Cart Icon */}
        <TouchableOpacity style={styles.cartIconContainer} activeOpacity={0.8}>
          <Ionicons name="cart" size={20} color="#FF00FF" />
          <View style={[styles.cartBadge, { backgroundColor: '#FF00FF40' }]}>
            <Text style={[styles.cartBadgeText, { color: '#FF00FF' }]}>3</Text>
          </View>
          <View style={styles.iconGlow} />
        </TouchableOpacity>

        {/* Notification Icon */}
        <TouchableOpacity style={styles.notifIconContainer} activeOpacity={0.8}>
          <Ionicons name="notifications" size={20} color="#00FF00" />
          <View style={[styles.notifBadge, { backgroundColor: '#00FF0040' }]}>
            <Text style={[styles.notifBadgeText, { color: '#00FF00' }]}>5</Text>
          </View>
          <View style={styles.iconGlow} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FF00FF',
          tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          header: () => renderHeader(),
          headerTitleAlign: 'left',
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons name="home" size={size} color={color} />
                <View style={[styles.tabIconGlow]} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="build"
          options={{
            title: 'Build',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons name="construct" size={size} color={color} />
                <View style={[styles.tabIconGlow]} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons name="search" size={size} color={color} />
                <View style={[styles.tabIconGlow]} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="user"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <View style={styles.tabIconContainer}>
                <Ionicons name="person" size={size} color={color} />
                <View style={[styles.tabIconGlow]} />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 0, 255, 0.2)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#FF00FF',
    opacity: 0.3,
    borderRadius: 20,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  logoTextContainer: {
    marginLeft: spacing.xs,
  },
  logoMainText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
  logoSubText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 3,
    marginTop: -4,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  // Icon Containers
  compareIconContainer: {
    position: 'relative',
    padding: spacing.xs,
  },
  cartIconContainer: {
    position: 'relative',
    padding: spacing.xs,
  },
  notifIconContainer: {
    position: 'relative',
    padding: spacing.xs,
  },
  iconGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  // Badges
  compareBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#00FFFF40',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00FFFF80',
  },
  compareBadgeText: {
    fontSize: 10,
    color: '#00FFFF',
    fontWeight: '900',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF00FF80',
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00FF0080',
  },
  notifBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  // Tab Bar Styles
  tabBar: {
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 0, 255, 0.2)',
    height: 75, // Increased height for better spacing
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
    position: 'absolute',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4, // Add margin top for spacing below icon
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: spacing.xs,
  },
  tabIconGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    opacity: 0.1,
    borderRadius: 20,
  },
});