import { StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { CosmicTheme, Fonts } from '@/constants/theme';
import { currentUser, legacyConstellationNodes } from '@/data/mockData';

export function ConstellationMap() {
  return (
    <GlassCard glow="purple" style={styles.container}>
      <View style={styles.map}>
        {legacyConstellationNodes.map((node) => {
          if (node.isCenter) return null;
          return (
            <View
              key={`line-${node.id}`}
              style={[
                styles.line,
                {
                  left: `${node.x * 100}%`,
                  top: `${node.y * 100}%`,
                  width: Math.abs(node.x - 0.5) * 200,
                  transform: [{ rotate: `${Math.atan2(node.y - 0.5, node.x - 0.5)}rad` }],
                },
              ]}
            />
          );
        })}
        {legacyConstellationNodes.map((node) => (
          <View
            key={node.id}
            style={[
              styles.node,
              {
                left: `${node.x * 100}%`,
                top: `${node.y * 100}%`,
                marginLeft: node.isCenter ? -14 : -8,
                marginTop: node.isCenter ? -14 : -8,
              },
            ]}>
            <View
              style={[
                styles.star,
                node.isCenter && styles.centerStar,
                !node.isCenter && { backgroundColor: CosmicTheme.purple },
              ]}>
              {node.isCenter && (
                <Text style={styles.centerInitials}>{currentUser.avatarInitials}</Text>
              )}
            </View>
            {!node.isCenter && (
              <Text style={styles.nodeName} numberOfLines={1}>
                {node.name}
              </Text>
            )}
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    overflow: 'hidden',
  },
  map: {
    height: 280,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    height: 1,
    backgroundColor: CosmicTheme.goldMuted,
    transformOrigin: 'left center',
  },
  node: {
    position: 'absolute',
    alignItems: 'center',
  },
  star: {
    width: 16,
    height: 16,
    borderRadius: 999,
    shadowColor: CosmicTheme.gold,
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  centerStar: {
    width: 28,
    height: 28,
    backgroundColor: CosmicTheme.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CosmicTheme.goldLight,
  },
  centerInitials: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: '800',
    color: CosmicTheme.background,
  },
  nodeName: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    color: CosmicTheme.textMuted,
    marginTop: 2,
    maxWidth: 50,
    textAlign: 'center',
  },
});
