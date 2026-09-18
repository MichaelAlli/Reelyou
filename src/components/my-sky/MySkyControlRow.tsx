import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { SearchGlyph } from '@/components/my-sky/MySkyControlIcons';
import { MySkyControlColors } from '@/components/my-sky/mySkyControlColors';
import { MySkyExploreToggle } from '@/components/my-sky/MySkyExploreToggle';
import { MySkyLabeledControl } from '@/components/my-sky/MySkyLabeledControl';
import { MySkyNorthStarAnchor } from '@/components/my-sky/MySkyNorthStarAnchor';
import { MySkyCopy } from '@/constants/mySkyCopy';

interface MySkyControlRowProps {
  northStarText: string;
  exploreEnabled: boolean;
  onToggleExplore: (enabled: boolean) => void;
  onOpenSearch: () => void;
}

function MySkyControlRowComponent({
  northStarText,
  exploreEnabled,
  onToggleExplore,
  onOpenSearch,
}: MySkyControlRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        <MySkyLabeledControl
          icon={
            <SearchGlyph
              size={16}
              color={MySkyControlColors.iconDefault}
              strokeWidth={1.7}
            />
          }
          label={MySkyCopy.searchControlLabel}
          onPress={onOpenSearch}
          accessibilityLabel={MySkyCopy.searchTitle}
        />
      </View>

      <View style={styles.center}>
        <MySkyNorthStarAnchor northStarText={northStarText} centered />
      </View>

      <View style={styles.side}>
        <MySkyExploreToggle enabled={exploreEnabled} onChange={onToggleExplore} />
      </View>
    </View>
  );
}

export const MySkyControlRow = memo(MySkyControlRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  side: {
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 3,
  },
});
