import { memo, useCallback, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type AccessibilityActionEvent,
} from 'react-native';

import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { Fonts, Radius } from '@/constants/theme';

const JOURNEY_TITLE_LONG_PRESS_MS = 450;

interface PlaySkyCueProps {
  onPress: () => void;
  onEditSequence?: () => void;
  showEditSequence?: boolean;
  journeyTitle?: string;
  onPressJourneyTitle?: () => void;
  onEditJourneyTitle?: () => void;
  disabled?: boolean;
  disabledHint?: string;
}

function PlaySkyCueComponent({
  onPress,
  onEditSequence,
  showEditSequence,
  journeyTitle,
  onPressJourneyTitle,
  onEditJourneyTitle,
  disabled = false,
  disabledHint,
}: PlaySkyCueProps) {
  const suppressJourneyPressRef = useRef(false);
  const [journeyTitleHeld, setJourneyTitleHeld] = useState(false);

  const handleJourneyTitlePress = useCallback(() => {
    if (suppressJourneyPressRef.current) {
      suppressJourneyPressRef.current = false;
      return;
    }
    onPressJourneyTitle?.();
  }, [onPressJourneyTitle]);

  const handleJourneyTitleLongPress = useCallback(() => {
    if (!onEditJourneyTitle) return;
    suppressJourneyPressRef.current = true;
    setJourneyTitleHeld(true);
    onEditJourneyTitle();
    setTimeout(() => setJourneyTitleHeld(false), 220);
  }, [onEditJourneyTitle]);

  const handleJourneyAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === 'edit') {
        onEditJourneyTitle?.();
      }
    },
    [onEditJourneyTitle],
  );

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.playPill,
          disabled && styles.playPillDisabled,
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={disabled ? disabledHint ?? SkywritePlayCopy.playSkyUnavailable : SkywritePlayCopy.playSky}
        accessibilityState={{ disabled }}>
        <Text style={[styles.playIcon, disabled && styles.playLabelDisabled]}>▶</Text>
        <Text style={[styles.playLabel, disabled && styles.playLabelDisabled]}>
          {SkywritePlayCopy.playSky}
        </Text>
      </Pressable>
      {disabled && disabledHint ? (
        <Text style={styles.disabledHint}>{disabledHint}</Text>
      ) : null}
      {journeyTitle ? (
        <Pressable
          onPress={handleJourneyTitlePress}
          onLongPress={onEditJourneyTitle ? handleJourneyTitleLongPress : undefined}
          delayLongPress={JOURNEY_TITLE_LONG_PRESS_MS}
          disabled={!onPressJourneyTitle && !onEditJourneyTitle}
          hitSlop={12}
          style={({ pressed }) => [
            styles.journeyTitleWrap,
            pressed && styles.journeyTitlePressed,
            journeyTitleHeld && styles.journeyTitleHeld,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            onPressJourneyTitle ? `Play ${journeyTitle}` : journeyTitle
          }
          accessibilityHint={
            onEditJourneyTitle
              ? 'Tap to play your journey. Long press to edit the title.'
              : undefined
          }
          accessibilityActions={
            onEditJourneyTitle
              ? [{ name: 'edit', label: 'Edit journey title' }]
              : undefined
          }
          onAccessibilityAction={onEditJourneyTitle ? handleJourneyAccessibilityAction : undefined}>
          <Text style={styles.journeyTitle}>{journeyTitle}</Text>
        </Pressable>
      ) : null}
      {!journeyTitle && showEditSequence && onEditSequence ? (
        <Pressable onPress={onEditSequence} hitSlop={8} style={styles.editLink}>
          <Text style={styles.editText}>{SkywritePlayCopy.editSequence}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const PlaySkyCue = memo(PlaySkyCueComponent);

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  playPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.4)',
    backgroundColor: 'rgba(8, 10, 28, 0.72)',
  },
  playIcon: {
    fontSize: 11,
    color: '#E8C872',
  },
  playLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#F5E6B8',
    letterSpacing: 0.3,
  },
  editLink: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  editText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(196, 168, 255, 0.85)',
  },
  journeyTitleWrap: {
    minHeight: 36,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  journeyTitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(196, 168, 255, 0.92)',
    letterSpacing: 0.2,
  },
  journeyTitlePressed: {
    opacity: 0.88,
  },
  journeyTitleHeld: {
    opacity: 0.72,
  },
  pressed: { opacity: 0.9 },
  playPillDisabled: {
    borderColor: 'rgba(232, 200, 114, 0.18)',
    backgroundColor: 'rgba(8, 10, 28, 0.35)',
  },
  playLabelDisabled: {
    color: 'rgba(245, 230, 184, 0.45)',
  },
  disabledHint: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: 'rgba(248,244,236,0.5)',
    textAlign: 'center',
    maxWidth: 280,
  },
});
