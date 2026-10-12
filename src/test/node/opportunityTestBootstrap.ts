/** Enable fixture catalog for StarPath opportunity tests in Node (no Expo bundler). */
(globalThis as typeof globalThis & { __DEV__?: boolean }).__DEV__ = true;
process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE ??= '1';
