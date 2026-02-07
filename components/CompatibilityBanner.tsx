import { colors, spacing } from '@/theme';
import { CompatibilityIssue } from '@/types/product';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface CompatibilityBannerProps {
  issues: CompatibilityIssue[];
}

export const CompatibilityBanner: React.FC<CompatibilityBannerProps> = ({ issues }) => {
  const hasIssues = issues.length > 0;
  const hasErrors = issues.some(issue => issue.type === 'error');

  if (!hasIssues) {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <Text style={styles.successText}>✓ All components are compatible</Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      hasErrors ? styles.errorContainer : styles.warningContainer
    ]}>
      <Text style={styles.title}>
        {hasErrors ? '❌ Compatibility Issues' : '⚠️ Compatibility Warnings'}
      </Text>
      <ScrollView style={styles.issuesList}>
        {issues.map((issue, index) => (
          <View key={index} style={styles.issueItem}>
            <Text style={styles.issueText}>• {issue.message}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  successContainer: {
    backgroundColor: colors.success + '20',
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  warningContainer: {
    backgroundColor: colors.warning + '20',
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    borderWidth: 1,
    borderColor: colors.error + '40',
  },
  successText: {
    color: colors.success,
    fontWeight: '600',
    fontSize: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  issuesList: {
    maxHeight: 150,
  },
  issueItem: {
    marginBottom: spacing.xs,
  },
  issueText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});