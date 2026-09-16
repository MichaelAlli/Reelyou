import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { GuidingLightCopy } from '@/constants/guidingLightCopy';
import { HomeLayout, HomePalette } from '@/constants/homeLayout';
import { Fonts } from '@/constants/theme';
import { useOnboarding } from '@/onboarding';
import { useThemedStyles } from '@/theme/useTheme';

interface HomeGuidingLightSectionProps {
  animatedStyle?: AnimatedStyle<ViewStyle>;
}

const CARD = {
  radius: 16,
  pad: 12,
  iconCircle: 34,
  gap: 11,
} as const;

function HomeGuidingLightSectionComponent({ animatedStyle }: HomeGuidingLightSectionProps) {
  const router = useRouter();
  const { guidingLightView, dismissGuidingLight } = useOnboarding();
  const [whyVisible, setWhyVisible] = useState(false);
  const { light, isPeaceState, whyExplanation } = guidingLightView;

  const styles = useThemedStyles((tokens) =>
    StyleSheet.create({
      wrap: {
        width: '100%',
      },
      shell: {
        borderRadius: CARD.radius,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth + 0.5,
        borderColor: 'rgba(232, 200, 114, 0.2)',
        backgroundColor: HomePalette.navyMid,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.14,
            shadowRadius: 6,
          },
          android: { elevation: 2 },
          default: {},
        }),
      },
      topSheen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '36%',
      },
      inner: {
        padding: CARD.pad,
        gap: 8,
      },
      mainRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: CARD.gap,
      },
      iconCircle: {
        width: CARD.iconCircle,
        height: CARD.iconCircle,
        borderRadius: CARD.iconCircle / 2,
        borderWidth: StyleSheet.hairlineWidth + 0.5,
        borderColor: 'rgba(232, 200, 114, 0.32)',
        backgroundColor: 'rgba(232, 200, 114, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      icon: {
        fontFamily: Fonts.sans,
        fontSize: 16,
        color: tokens.gold,
      },
      center: {
        flex: 1,
        gap: 3,
        paddingTop: 1,
        minWidth: 0,
      },
      title: {
        fontFamily: Fonts.serif,
        fontSize: 15.5,
        fontWeight: '600',
        color: HomePalette.textPrimary,
        letterSpacing: -0.12,
      },
      body: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        lineHeight: 15,
        color: 'rgba(235, 228, 248, 0.72)',
      },
      peace: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        lineHeight: 16,
        color: 'rgba(235, 228, 248, 0.62)',
      },
      actionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        paddingLeft: CARD.iconCircle + CARD.gap,
      },
      action: {
        fontFamily: Fonts.sans,
        fontSize: 11.5,
        fontWeight: '600',
        color: tokens.gold,
        minHeight: 44,
        lineHeight: 44,
        letterSpacing: 0.01,
      },
      companionLink: {
        fontFamily: Fonts.sans,
        fontSize: 11,
        color: 'rgba(235, 228, 248, 0.55)',
        minHeight: 44,
        lineHeight: 44,
      },
      modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(2, 4, 14, 0.72)',
        justifyContent: 'center',
        paddingHorizontal: 24,
      },
      modalPanel: {
        borderRadius: HomeLayout.cardRadius,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(232, 200, 114, 0.28)',
        backgroundColor: 'rgba(8, 12, 36, 0.96)',
        padding: 20,
        gap: 12,
      },
      modalTitle: {
        fontFamily: Fonts.serif,
        fontSize: 18,
        fontWeight: '600',
        color: HomePalette.textPrimary,
      },
      modalBody: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        lineHeight: 20,
        color: 'rgba(235, 228, 248, 0.78)',
      },
      modalClose: {
        alignSelf: 'flex-start',
        minHeight: 44,
        justifyContent: 'center',
      },
      modalCloseText: {
        fontFamily: Fonts.sans,
        fontSize: 14,
        fontWeight: '600',
        color: tokens.gold,
      },
    }),
  );

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <View style={styles.shell}>
        <LinearGradient
          colors={['rgba(10, 10, 28, 0.97)', 'rgba(6, 8, 20, 0.98)', 'rgba(8, 8, 24, 0.97)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(232, 200, 114, 0.06)', 'transparent', 'rgba(124, 92, 191, 0.04)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.04)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.4 }}
          style={styles.topSheen}
          pointerEvents="none"
        />

        <View style={styles.inner}>
          <View style={styles.mainRow}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>✦</Text>
            </View>
            <View style={styles.center}>
              <Text style={styles.title}>{GuidingLightCopy.sectionTitle}</Text>
              {isPeaceState || !light ? (
                <Text style={styles.peace}>{GuidingLightCopy.peaceMessage}</Text>
              ) : (
                <>
                  <Text style={styles.body}>{light.title}</Text>
                  {light.supportingText ? (
                    <Text style={styles.peace}>{light.supportingText}</Text>
                  ) : null}
                </>
              )}
            </View>
          </View>

          <View style={styles.actionRow}>
            {!isPeaceState && light && whyExplanation ? (
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={GuidingLightCopy.whyThis}
                onPress={() => setWhyVisible(true)}>
                <Text style={styles.action}>{GuidingLightCopy.whyThis}</Text>
              </Pressable>
            ) : null}
            {!isPeaceState && light ? (
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={GuidingLightCopy.dismiss}
                onPress={dismissGuidingLight}>
                <Text style={styles.action}>{GuidingLightCopy.dismiss}</Text>
              </Pressable>
            ) : null}
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={GuidingLightCopy.companionLink}
              onPress={() => router.push('/companion' as never)}>
              <Text style={styles.companionLink}>{GuidingLightCopy.companionLink}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={whyVisible}
        onRequestClose={() => setWhyVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <Text style={styles.modalTitle}>{GuidingLightCopy.whyTitle}</Text>
            <Text style={styles.modalBody}>{whyExplanation}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setWhyVisible(false)}
              style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

export const HomeGuidingLightSection = memo(HomeGuidingLightSectionComponent);
