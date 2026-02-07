import { CompareModal } from '@/components/CompareModal';
import { useCompareStore } from '@/store/useCompareStore';
import { colors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';

export default function TabsLayout() {
  const [showCompareModal, setShowCompareModal] = useState(false);
  const compareProducts = useCompareStore((state) => state.products);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="build"
          options={{
            title: 'Build',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="construct" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
            headerRight: () =>
              compareProducts.length > 0 ? (
                <Ionicons
                  name="git-compare"
                  size={24}
                  color={colors.primary}
                  style={{ marginRight: 16 }}
                  onPress={() => setShowCompareModal(true)}
                />
              ) : null,
          }}
        />
        <Tabs.Screen
          name="user"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
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