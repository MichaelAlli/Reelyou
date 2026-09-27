import Svg, { Circle } from 'react-native-svg';

/** Three-star cluster — joined group / people (no connecting lines). */
export function GroupsClusterIcon({ size = 14 }: { size?: number }) {
  const height = (size * 28) / 36;
  return (
    <Svg width={size} height={height} viewBox="0 0 36 28">
      <Circle cx={12} cy={18} r={2.6} fill="rgba(232, 200, 114, 0.92)" />
      <Circle cx={24} cy={18} r={2.4} fill="rgba(196, 168, 255, 0.88)" />
      <Circle cx={18} cy={9} r={2.8} fill="rgba(232, 200, 114, 0.98)" />
    </Svg>
  );
}
