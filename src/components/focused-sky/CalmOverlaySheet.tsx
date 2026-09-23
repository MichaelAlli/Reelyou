import { memo, useEffect, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ReelyouEasing, ReelyouMotion } from '@/constants/animation';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CalmOverlaySheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  backdropLabel?: string;
}

function CalmOverlaySheetComponent({
  visible,
  onClose,
  children,
  backdropLabel = 'Close',
}: CalmOverlaySheetProps) {
  const backdropOpacity = useSharedValue(0);
  const sheetOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(14);
  const sheetScale = useSharedValue(0.98);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, {
        duration: ReelyouMotion.fadeIn,
        easing: ReelyouEasing.out,
      });
      sheetOpacity.value = withTiming(1, {
        duration: ReelyouMotion.fadeIn + 40,
        easing: ReelyouEasing.out,
      });
      sheetTranslateY.value = withTiming(0, {
        duration: ReelyouMotion.slide,
        easing: ReelyouEasing.out,
      });
      sheetScale.value = withTiming(1, {
        duration: ReelyouMotion.scale + 80,
        easing: ReelyouEasing.out,
      });
      return;
    }

    backdropOpacity.value = withTiming(0, {
      duration: 280,
      easing: ReelyouEasing.inOut,
    });
    sheetOpacity.value = withTiming(0, {
      duration: 260,
      easing: ReelyouEasing.inOut,
    });
    sheetTranslateY.value = withTiming(10, {
      duration: 280,
      easing: ReelyouEasing.inOut,
    });
    sheetScale.value = withTiming(0.98, {
      duration: 280,
      easing: ReelyouEasing.inOut,
    });
  }, [backdropOpacity, sheetOpacity, sheetScale, sheetTranslateY, visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetMotionStyle = useAnimatedStyle(() => ({
    opacity: sheetOpacity.value,
    transform: [{ translateY: sheetTranslateY.value }, { scale: sheetScale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <AnimatedPressable
        style={[styles.backdrop, backdropStyle]}
        onPress={onClose}
        accessibilityLabel={backdropLabel}
      />
      <Animated.View style={[styles.sheet, sheetMotionStyle]}>
        {children}
      </Animated.View>
    </Modal>
  );
}

export const CalmOverlaySheet = memo(CalmOverlaySheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 4, 12, 0.55)',
  },
  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '16%',
    maxHeight: '68%',
  },
});
