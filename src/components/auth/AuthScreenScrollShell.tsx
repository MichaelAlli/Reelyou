import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import { authScrollBottomPadding } from '@/constants/authViewportLayout';

interface AuthScreenScrollShellProps {
  children: ReactNode;
  scrollBottomPadding: number;
  edges?: Edge[];
  contentContainerStyle?: ViewStyle;
}

/**
 * Shared scroll + keyboard-safe shell for Sign In / Sign Up (day + night).
 * Responsive only — no auth logic.
 */
export function AuthScreenScrollShell({
  children,
  scrollBottomPadding,
  edges = ['bottom'],
  contentContainerStyle,
}: AuthScreenScrollShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        style={styles.flex}>
        <ScrollView
          style={Platform.OS === 'web' ? styles.webScroll : styles.flex}
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle,
            { paddingBottom: authScrollBottomPadding(insets.bottom, scrollBottomPadding) },
          ]}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  webScroll: { flex: 1, overflow: 'scroll' } as ViewStyle,
  scrollContent: {
    flexGrow: 1,
  },
});
