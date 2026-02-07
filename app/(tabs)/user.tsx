import { useAuthStore } from '@/store/useAuthStore';
import { useBuildStore } from '@/store/useBuildStore';
import { colors, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function UserScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setPin = useAuthStore((state) => state.setPin);
  const clearBuild = useBuildStore((state) => state.clearBuild);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const handleChangePin = () => {
    if (newPin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }

    setPin(newPin);
    setNewPin('');
    setIsChangingPin(false);
    Alert.alert('Success', 'PIN updated successfully');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will clear your current build and preferences. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            clearBuild();
            Alert.alert('Success', 'All data cleared');
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => setIsChangingPin(true)}
        >
          <Text style={styles.menuItemText}>Change PIN</Text>
          <Text style={styles.menuItemSubtext}>
            {user?.pin ? '••••' : 'Not set'}
          </Text>
        </TouchableOpacity>

        {isChangingPin && (
          <View style={styles.pinChangeContainer}>
            <TextInput
              style={styles.pinInput}
              value={newPin}
              onChangeText={setNewPin}
              placeholder="Enter new 4-digit PIN"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
            <View style={styles.pinButtons}>
              <TouchableOpacity 
                style={[styles.pinButton, styles.pinButtonCancel]}
                onPress={() => {
                  setIsChangingPin(false);
                  setNewPin('');
                }}
              >
                <Text style={styles.pinButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pinButton, styles.pinButtonSave]}
                onPress={handleChangePin}
              >
                <Text style={styles.pinButtonSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleClearData}
        >
          <Text style={[styles.menuItemText, styles.dangerText]}>
            Clear Build Data
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Builds</Text>
        <View style={styles.emptyBuilds}>
          <Text style={styles.emptyBuildsText}>
            No saved builds yet.
          </Text>
          <Text style={styles.emptyBuildsSubtext}>
            Save your builds when connected to Supabase.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Version: 1.0.0</Text>
          <Text style={styles.infoText}>Build: MVP</Text>
          <Text style={styles.infoText}>Backend: Mock (Supabase Ready)</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textLight + 'CC',
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  menuItemSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dangerText: {
    color: colors.error,
  },
  pinChangeContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  pinInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  pinButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pinButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  pinButtonCancel: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pinButtonSave: {
    backgroundColor: colors.primary,
  },
  pinButtonCancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pinButtonSaveText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  emptyBuilds: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyBuildsText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptyBuildsSubtext: {
    fontSize: 14,
    color: colors.textSecondary + '80',
  },
  infoContainer: {
    gap: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logoutButton: {
    margin: spacing.lg,
    backgroundColor: colors.error + '20',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: 18,
    fontWeight: '600',
  },
});