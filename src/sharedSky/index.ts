/** Shared living Sky architecture — one graph; Focused Skywrite + My Sky are selectors only. */
export { buildSharedSkyState } from '@/sharedSky/buildSharedSkyState';
export { selectFocusedSkyView } from '@/sharedSky/selectFocusedSkyView';
export { selectExpandedMySkyView } from '@/sharedSky/selectExpandedMySkyView';
export { deriveEmergingGroups } from '@/sharedSky/emergingGroups';
export {
  deriveParticipationSignals,
  participationWeightForNode,
} from '@/sharedSky/participationSignals';
export { derivePermittedMeaningSignals } from '@/sharedSky/meaningSignals';
export {
  loadFocusedSkyPins,
  removePin,
  saveFocusedSkyPins,
  sortPins,
  upsertPin,
} from '@/sharedSky/focusedSkyPins';
export { resolveStarpathReferencesFromSky } from '@/sharedSky/starpathBridge';
export { FIXTURE_EMERGING_GROUPS } from '@/sharedSky/fixtures/emergingGroups.fixture';
export type {
  EmergingGroup,
  EmergingGroupLifecycle,
  FocusedSkyPin,
  FocusedSkyPinObjectType,
  FocusedSkySection,
  FocusedSkySession,
  FocusedSkyView,
  PermittedMeaningSignal,
  SharedSkyParticipationSignal,
  SharedSkyState,
  StarpathSkyReference,
} from '@/sharedSky/sharedSkyTypes';
