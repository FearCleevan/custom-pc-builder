import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  showCancel?: boolean;
  iconName?: string;
  customContent?: React.ReactNode;
  gradientColors?: [string, string];
  destructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  type = 'warning',
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  onConfirm,
  onCancel,
  showCancel = true,
  iconName,
  customContent,
  gradientColors,
  destructive = false,
  isLoading = false,
}) => {
  // Get colors based on type
  const getTypeColors = () => {
    switch (type) {
      case 'danger':
        return ['#FF0000', '#8B0000'];
      case 'success':
        return ['#00FF00', '#008000'];
      case 'info':
        return ['#00FFFF', '#008B8B'];
      case 'warning':
      default:
        return ['#FFA500', '#FF8C00'];
    }
  };

  const getIconConfig = () => {
    switch (type) {
      case 'danger':
        return { name: iconName || 'warning', color: '#FF0000' };
      case 'success':
        return { name: iconName || 'checkmark-circle', color: '#00FF00' };
      case 'info':
        return { name: iconName || 'information-circle', color: '#00FFFF' };
      case 'warning':
      default:
        return { name: iconName || 'warning', color: '#FFA500' };
    }
  };

  const iconConfig = getIconConfig();
  const colors = gradientColors || getTypeColors();

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#0a0a0f', '#1a1a2e']}
            style={styles.modalContent}
          >
            {/* Header with Icon */}
            <View style={styles.header}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: `${iconConfig.color}20` }
              ]}>
                <Ionicons
                  name={iconConfig.name as any}
                  size={40}
                  color={iconConfig.color}
                />
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>

            {/* Custom Content Slot */}
            {customContent && (
              <View style={styles.customContent}>
                {customContent}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              {showCancel && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.cancelButtonText}>
                      {cancelText}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  destructive && styles.destructiveButton,
                ]}
                onPress={onConfirm}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={colors}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <Ionicons name="reload" size={20} color="#FFF" />
                  ) : destructive ? (
                    <Ionicons name="trash" size={20} color="#FFF" />
                  ) : (
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                  )}
                  <Text style={styles.confirmButtonText}>
                    {isLoading ? 'PROCESSING...' : confirmText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  modalContent: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  customContent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  destructiveButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default ConfirmationModal;