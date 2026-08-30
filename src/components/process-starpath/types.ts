import type { SharedValue } from 'react-native-reanimated';

export interface ProcessStarPathPoint {
  x: number;
  y: number;
}

export interface ProcessStarPathProps {
  progress: SharedValue<number>;
  statusLabel: string;
  reduceMotion: boolean;
  isComplete: boolean;
  exitOpacity: SharedValue<number>;
  onNavigateHome: () => void;
  onStartProcessing: () => void;
}
