export type ReelyouSignalType =
  | 'messages'
  | 'connections'
  | 'opportunities'
  | 'communities'
  | 'sky_activity'
  | 'account_system';

export type ReelyouSignalPriority = 'normal' | 'elevated' | 'time_sensitive';

export interface ReelyouSignal {
  signalId: string;
  type: ReelyouSignalType;
  title: string;
  description: string;
  createdAt: number;
  sourceId: string;
  destinationRoute: string;
  destinationParams?: Record<string, string>;
  read: boolean;
  priority: ReelyouSignalPriority;
  dismissible: boolean;
  expiresAt?: number;
}

export interface ReelyouSignalsMetaState {
  dismissedSignalIds: string[];
  acknowledgedSignalIds: string[];
  snoozedUntil: Record<string, number>;
}

export const EMPTY_SIGNALS_META: ReelyouSignalsMetaState = {
  dismissedSignalIds: [],
  acknowledgedSignalIds: [],
  snoozedUntil: {},
};
