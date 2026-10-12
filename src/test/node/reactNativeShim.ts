/** Minimal stub for Node/tsx StarPath unit tests — not used in app runtime. */
export const Platform = { OS: 'web' as const, select: <T>(spec: { web?: T; default?: T }) => spec.web ?? spec.default };

export const Alert = { alert: () => undefined };
export const Linking = { openURL: async () => false };
export const Share = { share: async () => undefined };
export const BackHandler = { addEventListener: () => ({ remove: () => undefined }) };
export const AccessibilityInfo = { isReduceMotionEnabled: async () => false };

export function useWindowDimensions() {
  return { width: 390, height: 844, scale: 1, fontScale: 1 };
}

export type ViewStyle = Record<string, unknown>;
export type TextStyle = Record<string, unknown>;
export type NativeScrollEvent = unknown;
export type NativeSyntheticEvent<T> = { nativeEvent: T };
export type ScrollView = unknown;

export default { Platform };
