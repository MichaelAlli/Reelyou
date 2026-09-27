import Svg, { Circle, Line } from 'react-native-svg';

/** Compact constellation mark for joined-groups navigation chips. */
export function JoinedGroupsConstellationIcon({ size = 16 }: { size?: number }) {
  const height = (size * 28) / 36;
  return (
    <Svg width={size} height={height} viewBox="0 0 36 28">
      <Line x1={8} y1={18} x2={18} y2={8} stroke="rgba(196, 168, 255, 0.55)" strokeWidth={1.2} />
      <Line x1={18} y1={8} x2={28} y2={16} stroke="rgba(196, 168, 255, 0.55)" strokeWidth={1.2} />
      <Circle cx={8} cy={18} r={2.2} fill="rgba(232, 200, 114, 0.85)" />
      <Circle cx={18} cy={8} r={2.6} fill="rgba(232, 200, 114, 0.95)" />
      <Circle cx={28} cy={16} r={2.2} fill="rgba(196, 168, 255, 0.8)" />
    </Svg>
  );
}
