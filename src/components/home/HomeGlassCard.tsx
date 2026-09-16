import { LinearGradient } from 'expo-linear-gradient';
import { memo, type ReactNode } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { HomeLayout, HomePalette } from '@/constants/homeLayout';

interface HomeGlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  height?: number;
  minHeight?: number;
  noPad?: boolean;
  vibrant?: boolean;
}

function HomeGlassCardComponent({ children, style, height, minHeight, noPad, vibrant }: HomeGlassCardProps) {
  return (
    <View
      style={[
        styles.shell,
        height != null ? { height } : null,
        minHeight != null ? { minHeight } : null,
        style,
      ]}>
      <LinearGradient
        colors={
          vibrant
            ? ['rgba(12, 10, 28, 0.94)', 'rgba(6, 8, 20, 0.92)', 'rgba(10, 8, 24, 0.93)']
            : ['rgba(8, 10, 24, 0.93)', 'rgba(5, 7, 16, 0.95)', 'rgba(7, 9, 20, 0.91)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {vibrant ? (
        <LinearGradient
          colors={['rgba(155, 126, 222, 0.06)', 'transparent', 'rgba(232, 140, 60, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.22 }}
        style={styles.topEdge}
        pointerEvents="none"
      />
      <View style={styles.edgeAccent} pointerEvents="none" />
      <View style={[styles.inner, noPad ? styles.noPad : null]}>{children}</View>
    </View>
  );
}

export const HomeGlassCard = memo(HomeGlassCardComponent);

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    borderRadius: HomeLayout.cardRadius,
    overflow: 'hidden',
    borderWidth: HomeLayout.cardBorder,
    borderColor: HomePalette.cardEdge,
    backgroundColor: HomePalette.cardFill,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  edgeAccent: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(232, 200, 114, 0.18)',
  },
  inner: {
    flex: 1,
    flexDirection: 'column',
    padding: HomeLayout.cardPad,
  },
  noPad: {
    padding: 0,
  },
});
