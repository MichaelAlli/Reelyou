import Svg, { Circle, Line } from 'react-native-svg';

/** Connected-star formation — distinct from three-star Groups cluster. */
export function ConstellationsLineIcon({ size = 14 }: { size?: number }) {
  const height = (size * 28) / 36;
  return (
    <Svg width={size} height={height} viewBox="0 0 36 28">
      <Line x1={8} y1={20} x2={18} y2={7} stroke="rgba(232, 200, 114, 0.75)" strokeWidth={1.5} />
      <Line x1={18} y1={7} x2={28} y2={20} stroke="rgba(232, 200, 114, 0.75)" strokeWidth={1.5} />
      <Line x1={8} y1={20} x2={28} y2={20} stroke="rgba(196, 168, 255, 0.55)" strokeWidth={1.2} />
      <Circle cx={8} cy={20} r={2.2} fill="rgba(196, 168, 255, 0.9)" />
      <Circle cx={18} cy={7} r={2.5} fill="rgba(232, 200, 114, 0.95)" />
      <Circle cx={28} cy={20} r={2.2} fill="rgba(196, 168, 255, 0.9)" />
    </Svg>
  );
}
