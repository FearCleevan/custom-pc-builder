import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ToastNotificationProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  visible,
  message,
  type,
}) => {
  if (!visible) return null;

  return (
    <View style={[
      styles.toastContainer,
      type === 'success' ? styles.toastSuccess : styles.toastError
    ]}>
      <Ionicons 
        name={type === 'success' ? "checkmark-circle" : "alert-circle"} 
        size={20} 
        color="#FFF" 
      />
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toastSuccess: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
  },
  toastError: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  toastText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});