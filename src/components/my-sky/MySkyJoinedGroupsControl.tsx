import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { GroupsClusterIcon } from '@/components/my-sky/GroupsClusterIcon';
import { MySkySecondRowChip } from '@/components/my-sky/MySkySecondRowChip';
import { MySkyCopy } from '@/constants/mySkyCopy';

interface MySkyJoinedGroupsControlProps {
  showActivityHint: boolean;
  onPress: () => void;
}

function MySkyJoinedGroupsControlComponent({
  showActivityHint,
  onPress,
}: MySkyJoinedGroupsControlProps) {
  return (
    <View style={styles.wrap}>
      <MySkySecondRowChip
        label={MySkyCopy.joinedGroupsControlLabel}
        accessibilityLabel={MySkyCopy.joinedGroupsControlA11y}
        icon={<GroupsClusterIcon size={13} />}
        onPress={onPress}
      />
      {showActivityHint ? <View style={styles.dot} /> : null}
    </View>
  );
}

export const MySkyJoinedGroupsControl = memo(MySkyJoinedGroupsControlComponent);

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(232, 200, 114, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(8, 12, 28, 0.9)',
  },
});
