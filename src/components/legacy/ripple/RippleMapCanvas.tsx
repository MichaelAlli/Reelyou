import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { RippleMetricIcon } from '@/components/legacy/ripple/RippleMetricIcon';
import { Fonts } from '@/constants/theme';
import type { RippleDirectNode, RippleDownstreamNode } from '@/legacy/buildLegacyRippleViewModel';

interface RippleMapCanvasProps {
  width: number;
  height: number;
  directNodes: RippleDirectNode[];
  downstreamNodes?: RippleDownstreamNode[];
  showDownstream?: boolean;
  /** Larger map detail layout — smaller rings, shorter captions on downstream nodes. */
  density?: 'landing' | 'detail';
  /** Current user label at ripple origin (first name or initials). */
  centerOriginLabel: string;
  onNodePress?: (personUserId: string) => void;
}

function PersonNode({
  node,
  fieldWidth,
  fieldHeight,
  compact,
  onPress,
}: {
  node: RippleDirectNode | RippleDownstreamNode;
  fieldWidth: number;
  fieldHeight: number;
  compact: boolean;
  onPress: () => void;
}) {
  const nodeWidth = compact ? 88 : 96;
  const left = Math.min(
    fieldWidth - nodeWidth,
    Math.max(0, node.anchorX * fieldWidth - nodeWidth / 2),
  );
  const top = Math.min(
    fieldHeight - (compact ? 72 : 88),
    Math.max(0, node.anchorY * fieldHeight - (compact ? 36 : 40)),
  );
  const showStatement = !compact || !node.isDownstream;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.nodeWrap, { left, top, width: nodeWidth }]}
      accessibilityRole="button"
      accessibilityLabel={`${node.displayName}, ${node.statement}`}>
      <View style={[styles.nodeRingOuter, { borderColor: `${node.ringColor}55` }]}>
        <View
          style={[
            styles.nodeRingInner,
            compact && styles.nodeRingInnerCompact,
            { borderColor: node.ringColor },
          ]}>
          {node.avatarUri ? (
            <Image
              source={{ uri: node.avatarUri }}
              style={[styles.avatar, compact && styles.avatarCompact]}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                compact && styles.avatarCompact,
                { backgroundColor: node.avatarColor },
              ]}>
              <Text style={[styles.avatarInitials, compact && styles.avatarInitialsCompact]}>
                {node.avatarInitials}
              </Text>
            </View>
          )}
          <View style={[styles.nodeBadge, { backgroundColor: node.ringColor }]}>
            <RippleMetricIcon kind={node.iconKind} color="#FFFFFF" size={9} />
          </View>
        </View>
      </View>
      <View style={styles.labelPlate}>
        <Text style={styles.nodeName} numberOfLines={1}>
          {node.displayName}
        </Text>
        {showStatement ? (
          <Text style={styles.nodeStatement} numberOfLines={2}>
            {node.statement}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function RippleMapCanvas({
  width,
  height,
  directNodes,
  downstreamNodes = [],
  showDownstream = false,
  density = 'landing',
  centerOriginLabel,
  onNodePress,
}: RippleMapCanvasProps) {
  const cx = width / 2;
  const cy = height * (density === 'detail' ? 0.5 : 0.46);
  const compact = density === 'detail';

  const nodes = showDownstream ? [...directNodes, ...downstreamNodes] : directNodes;

  return (
    <View style={[styles.field, { width, height }]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="coreGlow" cx="50%" cy="46%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#FFE9A8" stopOpacity="0.75" />
            <Stop offset="55%" stopColor="#E8C56A" stopOpacity="0.28" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {[0.18, 0.28, 0.38, 0.48].map((scale, index) => (
          <Circle
            key={scale}
            cx={cx}
            cy={cy}
            r={width * scale * 0.2}
            stroke="rgba(232, 200, 114, 0.32)"
            strokeWidth={index === 0 ? 2 : 1}
            fill="none"
          />
        ))}
        <Circle cx={cx} cy={cy} r={width * 0.14} fill="url(#coreGlow)" />
      </Svg>

      <View style={[styles.crystalWrap, { left: cx - 34, top: cy - 38 }]}>
        <View style={styles.crystalOuter}>
          <View style={styles.crystalMid}>
            <View style={styles.crystalCore} />
          </View>
        </View>
        <Text style={styles.originLabel} numberOfLines={1} accessibilityLabel={`You, ${centerOriginLabel}`}>
          {centerOriginLabel}
        </Text>
      </View>

      {nodes.map((node) => (
        <PersonNode
          key={'rippleEventId' in node ? node.rippleEventId : node.userId}
          node={node}
          fieldWidth={width}
          fieldHeight={height}
          compact={compact && 'isDownstream' in node && node.isDownstream}
          onPress={() => onNodePress?.(node.userId)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    alignSelf: 'center',
    marginTop: 4,
    overflow: 'hidden',
  },
  crystalWrap: {
    position: 'absolute',
    alignItems: 'center',
    width: 72,
  },
  originLabel: {
    marginTop: 6,
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '800',
    color: '#5A4A12',
    textAlign: 'center',
    maxWidth: 72,
    paddingHorizontal: 2,
  },
  crystalOuter: {
    width: 60,
    height: 60,
    borderRadius: 18,
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'rgba(255, 248, 220, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crystalMid: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 236, 170, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crystalCore: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: '#FFF6D6',
    borderWidth: 1,
    borderColor: '#E8C56A',
  },
  nodeWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  nodeRingOuter: {
    padding: 3,
    borderRadius: 999,
    borderWidth: 2,
  },
  nodeRingInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  nodeRingInnerCompact: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarInitialsCompact: {
    fontSize: 11,
  },
  nodeBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  labelPlate: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    maxWidth: 102,
    width: '100%',
  },
  nodeName: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
  },
  nodeStatement: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    lineHeight: 12,
    color: 'rgba(45, 55, 72, 0.82)',
    textAlign: 'center',
    marginTop: 2,
  },
});
