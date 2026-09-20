import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

interface PaginationDotsProps {
  count?: number;
  activeIndex?: number;
  color?: string;
  inactiveColor?: string;
}

function PaginationDotsComponent({
  count = 3,
  activeIndex = 0,
  color = '#E8C872',
  inactiveColor = 'rgba(196, 168, 255, 0.45)',
}: PaginationDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={`dot-${i}`}
          style={[
            styles.dot,
            {
              backgroundColor: i === activeIndex ? color : inactiveColor,
              width: i === activeIndex ? 6 : 4,
              height: i === activeIndex ? 6 : 4,
            },
          ]}
        />
      ))}
    </View>
  );
}

export const PaginationDots = memo(PaginationDotsComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    borderRadius: 999,
  },
});
