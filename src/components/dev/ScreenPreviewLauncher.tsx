import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DEV_SCREEN_PREVIEW_TARGETS } from '@/constants/devScreenPreviewRoutes';
import { isScreenPreviewEnabled } from '@/constants/devFlags';
import { Fonts } from '@/constants/theme';
import { spacing } from '@/theme';

/**
 * DEV-ONLY screen launcher — jumps directly to production routes.
 * Does not modify auth, onboarding, or navigation logic on target screens.
 */
export function ScreenPreviewLauncher() {
  const router = useRouter();

  if (!isScreenPreviewEnabled()) {
    return null;
  }
  return (
    <View style={styles.list}>
      {DEV_SCREEN_PREVIEW_TARGETS.map((target) => (
        <Pressable
          key={target.id}
          accessibilityRole="button"
          accessibilityLabel={`Preview ${target.label}`}
          onPress={() => router.push(target.href as never)}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
          <View style={styles.rowText}>
            <Text style={styles.label}>{target.label}</Text>
            <Text style={styles.description}>{target.description}</Text>
            <Text style={styles.route}>{target.href}</Text>
          </View>
          <Text style={styles.chevron}>→</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
    gap: spacing.Spacing8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: spacing.Spacing16,
    paddingVertical: spacing.Spacing12,
    gap: spacing.Spacing12,
  },
  rowPressed: {
    opacity: 0.82,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
    color: '#F8F9FC',
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(248, 249, 252, 0.68)',
  },
  route: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(212, 175, 55, 0.85)',
    marginTop: 2,
  },
  chevron: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '600',
    color: '#D4AF37',
  },
});
