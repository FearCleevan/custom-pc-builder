import { THEME } from '@/theme/indexs';
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

const { colors: COLORS, spacing: SPACING, borderRadius: BORDER_RADIUS, shadows: SHADOWS } = THEME;
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
        return [COLORS.danger, COLORS.dangerDark];
      case 'success':
        return [COLORS.success, COLORS.successDark];
      case 'info':
        return [COLORS.info, COLORS.infoDark];
      case 'warning':
      default:
        return [COLORS.warning, COLORS.warningDark];
    }
  };

  const getIconConfig = () => {
    switch (type) {
      case 'danger':
        return { 
          name: iconName || 'warning', 
          color: COLORS.danger,
          backgroundColor: COLORS.danger + '20'
        };
      case 'success':
        return { 
          name: iconName || 'checkmark-circle', 
          color: COLORS.success,
          backgroundColor: COLORS.success + '20'
        };
      case 'info':
        return { 
          name: iconName || 'information-circle', 
          color: COLORS.info,
          backgroundColor: COLORS.info + '20'
        };
      case 'warning':
      default:
        return { 
          name: iconName || 'warning', 
          color: COLORS.warning,
          backgroundColor: COLORS.warning + '20'
        };
    }
  };

  const getButtonStyle = () => {
    if (destructive) {
      return {
        gradient: THEME.colors.gradients.danger,
        icon: 'trash',
        backgroundColor: COLORS.danger,
      };
    }
    
    switch (type) {
      case 'danger':
        return {
          gradient: THEME.colors.gradients.danger,
          icon: 'warning',
          backgroundColor: COLORS.danger,
        };
      case 'success':
        return {
          gradient: THEME.colors.gradients.success,
          icon: 'checkmark',
          backgroundColor: COLORS.success,
        };
      case 'info':
        return {
          gradient: THEME.colors.gradients.primary,
          icon: 'checkmark',
          backgroundColor: COLORS.primary,
        };
      case 'warning':
      default:
        return {
          gradient: THEME.colors.gradients.warning,
          icon: 'checkmark',
          backgroundColor: COLORS.warning,
        };
    }
  };

  const iconConfig = getIconConfig();
  const colors = gradientColors || getTypeColors();
  const buttonStyle = getButtonStyle();

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
            colors={THEME.colors.gradients.dark}
            style={styles.modalContent}
          >
            {/* Header with Icon */}
            <View style={styles.header}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: iconConfig.backgroundColor }
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
                  <View style={styles.cancelButtonInner}>
                    <Text style={styles.cancelButtonText}>
                      {cancelText}
                    </Text>
                  </View>
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
                  colors={buttonStyle.gradient}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <Ionicons name="reload" size={20} color="#FFF" />
                  ) : (
                    <Ionicons name={buttonStyle.icon as any} size={20} color="#FFF" />
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
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContainer: {
    width: Math.min(SCREEN_WIDTH * 0.9, 400),
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.xl,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  title: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  message: {
    fontSize: THEME.typography.fontSizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: THEME.typography.lineHeights.relaxed * THEME.typography.fontSizes.md,
  },
  customContent: {
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonInner: {
    backgroundColor: THEME.components.button.secondary.backgroundColor,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  destructiveButton: {
    borderWidth: 1,
    borderColor: COLORS.danger + '30',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  cancelButtonText: {
    color: THEME.components.button.secondary.textColor,
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    letterSpacing: THEME.typography.letterSpacing.wide,
  },
});

export default ConfirmationModal;