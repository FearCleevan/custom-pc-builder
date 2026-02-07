import { useAuthStore } from '@/store/useAuthStore';
import { colors, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState<string[]>(Array(4).fill(''));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const user = useAuthStore((state) => state.user);
  const setPinAction = useAuthStore((state) => state.setPin);
  const verifyPin = useAuthStore((state) => state.verifyPin);

  useEffect(() => {
    if (user?.pin) {
      setIsSettingPin(false);
    } else {
      setIsSettingPin(true);
    }
  }, [user]);

  const handleNumberPress = (num: number) => {
    if (currentIndex >= 4) return;

    const newPin = [...pin];
    newPin[currentIndex] = num.toString();
    setPin(newPin);

    if (currentIndex === 3) {
      // All digits entered
      setTimeout(() => {
        const enteredPin = newPin.join('');
        if (isSettingPin) {
          setPinAction(enteredPin);
          Alert.alert('Success', 'PIN set successfully!', [
            { text: 'OK', onPress: () => router.replace('/(tabs)/home') },
          ]);
        } else {
          const isValid = verifyPin(enteredPin);
          if (isValid) {
            router.replace('/(tabs)/home');
          } else {
            Alert.alert('Error', 'Invalid PIN');
            setPin(Array(4).fill(''));
            setCurrentIndex(0);
          }
        }
      }, 300);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBackspace = () => {
    if (currentIndex === 0) return;

    const newPin = [...pin];
    newPin[currentIndex - 1] = '';
    setPin(newPin);
    setCurrentIndex(currentIndex - 1);
  };

  const handleClear = () => {
    setPin(Array(4).fill(''));
    setCurrentIndex(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isSettingPin ? 'Set Your PIN' : 'Enter Your PIN'}
        </Text>
        <Text style={styles.subtitle}>
          {isSettingPin 
            ? 'Create a 4-digit PIN for security' 
            : 'Enter your 4-digit PIN to continue'
          }
        </Text>
      </View>

      {/* PIN Dots */}
      <View style={styles.pinContainer}>
        {pin.map((digit, index) => (
          <View 
            key={index} 
            style={[
              styles.pinDot,
              digit ? styles.pinDotFilled : styles.pinDotEmpty,
              index === currentIndex && styles.pinDotActive,
            ]}
          />
        ))}
      </View>

      {/* Number Pad */}
      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numberButton}
            onPress={() => handleNumberPress(num)}
          >
            <Text style={styles.numberText}>{num}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={[styles.numberButton, styles.clearButton]}
          onPress={handleClear}
        >
          <Text style={[styles.numberText, styles.clearText]}>Clear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.numberButton}
          onPress={() => handleNumberPress(0)}
        >
          <Text style={styles.numberText}>0</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.numberButton, styles.backspaceButton]}
          onPress={handleBackspace}
        >
          <Text style={[styles.numberText, styles.backspaceText]}>⌫</Text>
        </TouchableOpacity>
      </View>

      {isSettingPin && (
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    gap: spacing.lg,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  pinDotEmpty: {
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
  },
  pinDotActive: {
    borderColor: colors.primary,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  numberText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  clearButton: {
    backgroundColor: colors.cardBackground,
  },
  clearText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  backspaceButton: {
    backgroundColor: colors.cardBackground,
  },
  backspaceText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  skipButton: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  skipButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});