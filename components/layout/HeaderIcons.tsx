// components/layout/HeaderIcons.tsx
import { CompareModal } from '@/components/CompareModal';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconBadge } from './IconBadge';

interface HeaderIconsProps {
  compareCount: number;
}

export const HeaderIcons = ({ compareCount }: HeaderIconsProps) => {
  const [showCompareModal, setShowCompareModal] = useState(false);

  return (
    <>
      <View style={styles.headerIcons}>
        {/* Compare Icon */}
        {compareCount > 0 && (
          <IconBadge
            icon="git-compare"
            count={compareCount}
            badgeType="secondary"
            onPress={() => setShowCompareModal(true)}
          />
        )}

        {/* Cart Icon */}
        <IconBadge
          icon="cart"
          count={3}
          badgeType="primary"
          onPress={() => console.log('Cart pressed')}
        />

        {/* Notification Icon */}
        <IconBadge
          icon="notifications"
          count={5}
          badgeType="success"
          onPress={() => console.log('Notifications pressed')}
        />
      </View>

      <CompareModal
        visible={showCompareModal}
        onClose={() => setShowCompareModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.lg,
  },
});