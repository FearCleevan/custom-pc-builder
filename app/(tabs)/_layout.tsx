import { CompareModal } from '@/components/CompareModal';
import { useCompareStore } from '@/store/useCompareStore';
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 70;

export default function TabsLayout() {
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const compareProducts = useCompareStore((state) => state.products);
  const router = useRouter();

  const handleTabPress = (tabName: string, routeName: string) => {
    setActiveTab(tabName);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleComparePress = () => {
    setShowCompareModal(true);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleNotificationPress = () => {
    // TODO: Implement notifications
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <>
      {/* Top Header */}
      <LinearGradient
        colors={['rgba(10, 10, 15, 0.95)', 'rgba(26, 26, 46, 0.9)']}
        style={styles.header}
      >
        {/* Logo and App Name */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <LinearGradient
              colors={['#FF00FF', '#9400D3']}
              style={styles.logoGradient}
            >
              <FontAwesome6 name="computer" size={20} color="#FFF" />
            </LinearGradient>
            <View style={styles.logoGlow} />
          </View>
          <View>
            <Text style={styles.appName}>CYBER</Text>
            <Text style={styles.appNameSub}>BUILDER</Text>
          </View>
        </View>

        {/* Top Right Icons */}
        <View style={styles.headerIcons}>
          {/* Compare Icon with Badge */}
          {compareProducts.length > 0 && (
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleComparePress}
            >
              <LinearGradient
                colors={['#FF00FF', '#9400D3']}
                style={styles.compareIcon}
              >
                <Ionicons name="git-compare" size={20} color="#FFF" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{compareProducts.length}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Notification Icon */}
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleNotificationPress}
          >
            <View style={styles.notificationIcon}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
              <View style={styles.notificationDot} />
            </View>
          </TouchableOpacity>

          {/* Build Status Indicator */}
          <TouchableOpacity 
            style={styles.buildStatus}
            onPress={() => router.push('/(tabs)/build')}
          >
            <LinearGradient
              colors={['#00FFFF', '#008B8B']}
              style={styles.buildStatusGradient}
            >
              <MaterialIcons name="build" size={16} color="#FFF" />
              <Text style={styles.buildStatusText}>BUILD</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          listeners={{
            tabPress: () => handleTabPress('home', 'home'),
          }}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                focused={focused}
                activeTab={activeTab}
                tabName="home"
                iconName="home"
                label="HOME"
                gradientColors={['#FF00FF', '#9400D3']}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="build"
          listeners={{
            tabPress: () => handleTabPress('build', 'build'),
          }}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                focused={focused}
                activeTab={activeTab}
                tabName="build"
                iconName="construct"
                label="BUILD"
                gradientColors={['#00FFFF', '#008B8B']}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          listeners={{
            tabPress: () => handleTabPress('explore', 'explore'),
          }}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                focused={focused}
                activeTab={activeTab}
                tabName="explore"
                iconName="search"
                label="EXPLORE"
                gradientColors={['#00FF00', '#006400']}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="user"
          listeners={{
            tabPress: () => handleTabPress('user', 'user'),
          }}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                focused={focused}
                activeTab={activeTab}
                tabName="user"
                iconName="person"
                label="PROFILE"
                gradientColors={['#FFFF00', '#FF8C00']}
              />
            ),
          }}
        />
      </Tabs>

      {/* Compare Modal */}
      <CompareModal
        visible={showCompareModal}
        onClose={() => setShowCompareModal(false)}
      />
    </>
  );
}

// Custom Tab Icon Component
const TabIcon = ({ 
  focused, 
  activeTab, 
  tabName, 
  iconName, 
  label, 
  gradientColors 
}: any) => {
  const isActive = activeTab === tabName;

  return (
    <View style={styles.tabIconContainer}>
      <LinearGradient
        colors={isActive ? gradientColors : ['transparent', 'transparent']}
        style={[
          styles.tabIconBackground,
          isActive && styles.tabIconBackgroundActive
        ]}
      >
        <Ionicons 
          name={iconName} 
          size={24} 
          color={isActive ? '#FFF' : 'rgba(255,255,255,0.5)'}
        />
      </LinearGradient>
      
      <Text style={[
        styles.tabLabel,
        isActive && styles.tabLabelActive
      ]}>
        {label}
      </Text>

      {/* Active Indicator Glow */}
      {isActive && (
        <>
          <View style={[
            styles.activeGlow,
            { backgroundColor: gradientColors[0] }
          ]} />
          <View style={[
            styles.activePulse,
            { backgroundColor: gradientColors[0] }
          ]} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 0, 255, 0.1)',
    zIndex: 100,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    position: 'relative',
  },
  logoGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
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
    // blurRadius: 15,
    zIndex: -1,
  },
  appName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
    lineHeight: 18,
  },
  appNameSub: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF00FF',
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 6,
  },
  compareIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#00FFFF',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0a0a0f',
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
  },
  buildStatus: {
    marginLeft: 8,
  },
  buildStatusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  buildStatusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  
  // Tab Bar Styles
  sceneContainer: {
    backgroundColor: '#0a0a0f',
  },
  tabBar: {
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 0, 255, 0.1)',
    height: TAB_BAR_HEIGHT,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 20,
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  
  // Tab Icon Styles
  tabIconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  tabIconBackground: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabIconBackgroundActive: {
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#FFF',
    fontWeight: '900',
  },
  activeGlow: {
    position: 'absolute',
    top: 5,
    width: 30,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
    blurRadius: 5,
  },
  activePulse: {
    position: 'absolute',
    top: 5,
    width: 30,
    height: 4,
    borderRadius: 2,
    opacity: 0.4,
    animation: 'pulse 2s infinite',
  },
});