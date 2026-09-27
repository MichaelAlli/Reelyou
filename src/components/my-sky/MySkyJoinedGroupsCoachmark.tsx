import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MySkyCopy } from '@/constants/mySkyCopy';
import { Fonts } from '@/constants/theme';

interface MySkyJoinedGroupsCoachmarkProps {
  visible: boolean;
  onDismiss: () => void;
  /** Tighter padding when shown directly under the Groups chip. */
  anchored?: boolean;
}

function MySkyJoinedGroupsCoachmarkComponent({
  visible,
  onDismiss,
  anchored = false,
}: MySkyJoinedGroupsCoachmarkProps) {
  if (!visible) return null;

  return (
    <View style={[styles.wrap, anchored && styles.wrapAnchored]} pointerEvents="box-none">
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel={MySkyCopy.joinedGroupsCoachmarkA11y}
        style={styles.bubble}>
        <Text style={styles.text}>{MySkyCopy.joinedGroupsCoachmark}</Text>
      </Pressable>
    </View>
  );
}

export const MySkyJoinedGroupsCoachmark = memo(MySkyJoinedGroupsCoachmarkComponent);

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 8,
    paddingTop: 2,
    paddingBottom: 4,
    zIndex: 5,
  },
  wrapAnchored: {
    paddingHorizontal: 0,
    paddingTop: 4,
    paddingBottom: 0,
    maxWidth: 220,
  },
  bubble: {
    alignSelf: 'flex-start',
    maxWidth: 260,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(12, 16, 32, 0.94)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.32)',
  },
  text: {
    fontFamily: Fonts.sans,
    fontSize: 11.5,
    lineHeight: 15,
    color: 'rgba(248, 244, 236, 0.88)',
  },
});
