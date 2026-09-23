import { memo, useCallback, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ReelyouEasing } from '@/constants/animation';
import { HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';

const SWIPE_DISMISS = 72;
const DISMISS_MS = 240;

interface HomeDismissibleSignalCardProps {
  children: ReactNode;
  onDismiss: () => void;
  dismissAccessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  showDismissButton?: boolean;
}

function HomeDismissibleSignalCardComponent({
  children,
  onDismiss,
  dismissAccessibilityLabel = 'Dismiss notification',
  style,
  showDismissButton = true,
}: HomeDismissibleSignalCardProps) {
  const dismissed = useSharedValue(false);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const finishDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const animateDismiss = useCallback(() => {
    if (dismissed.value) return;
    dismissed.value = true;
    opacity.value = withTiming(0, { duration: DISMISS_MS, easing: ReelyouEasing.out });
    translateX.value = withTiming(-120, { duration: DISMISS_MS, easing: ReelyouEasing.out }, (done) => {
      if (done) {
        runOnJS(finishDismiss)();
      }
    });
  }, [dismissed, finishDismiss, opacity, translateX]);

  const pan = Gesture.Pan()
    .activeOffsetX([-18, 18])
    .failOffsetY([-12, 12])
    .onUpdate((event) => {
      if (dismissed.value) return;
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd((event) => {
      if (dismissed.value) return;
      if (event.translationX < -SWIPE_DISMISS || event.velocityX < -420) {
        runOnJS(animateDismiss)();
        return;
      }
      translateX.value = withTiming(0, { duration: 180, easing: ReelyouEasing.out });
    });

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.root, style, cardStyle]}>
        {children}
        {showDismissButton ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={dismissAccessibilityLabel}
            hitSlop={10}
            onPress={animateDismiss}
            style={({ pressed }) => [styles.dismissBtn, pressed && styles.dismissPressed]}
          >
            <Text style={styles.dismissGlyph}>×</Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  dismissBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 10, 28, 0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(235, 228, 248, 0.22)',
  },
  dismissPressed: {
    opacity: 0.85,
  },
  dismissGlyph: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '300',
    color: HomePalette.textPrimary,
    marginTop: -1,
  },
});

export const HomeDismissibleSignalCard = memo(HomeDismissibleSignalCardComponent);
