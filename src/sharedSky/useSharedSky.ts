import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  resolveParticipatingCommunityIds,
  resolveSkyConnectionActivities,
} from '@/mySky/skyConnectionSources';
import { useOnboarding } from '@/onboarding';
import { buildSharedSkyState } from '@/sharedSky/buildSharedSkyState';
import {
  loadFocusedSkyPins,
  removePin,
  saveFocusedSkyPins,
  upsertPin,
} from '@/sharedSky/focusedSkyPins';
import { selectExpandedMySkyView } from '@/sharedSky/selectExpandedMySkyView';
import { selectFocusedSkyView } from '@/sharedSky/selectFocusedSkyView';
import type { FocusedSkyPinObjectType } from '@/sharedSky/sharedSkyTypes';
import { resolveStarpathReferencesFromSky } from '@/sharedSky/starpathBridge';

/** Shared living Sky selectors — wraps approved My Sky graph without duplicating stores. */
export function useSharedSky() {
  const {
    aroundYourSkyFeed,
    mySkyView,
    mySkyVisibleLayers,
    mySkyVisibilitySettings,
    personalizationProfile,
  } = useOnboarding();

  const skyConnectionActivities = useMemo(
    () => resolveSkyConnectionActivities(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const participatingCommunityIds = useMemo(
    () => resolveParticipatingCommunityIds(aroundYourSkyFeed),
    [aroundYourSkyFeed],
  );

  const [pins, setPins] = useState<Awaited<ReturnType<typeof loadFocusedSkyPins>>>([]);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);

  useEffect(() => {
    let live = true;
    loadFocusedSkyPins().then((loaded) => {
      if (live) setPins(loaded);
    });
    return () => {
      live = false;
    };
  }, []);

  const sharedState = useMemo(
    () =>
      buildSharedSkyState(
        personalizationProfile,
        mySkyVisibleLayers,
        mySkyView.evolution,
        skyConnectionActivities,
        participatingCommunityIds,
        mySkyVisibilitySettings,
      ),
    [
      mySkyView.evolution,
      mySkyVisibleLayers,
      mySkyVisibilitySettings,
      participatingCommunityIds,
      personalizationProfile,
      skyConnectionActivities,
    ],
  );

  const focusedView = useMemo(
    () => selectFocusedSkyView(sharedState, pins),
    [pins, sharedState],
  );

  const expandedView = useMemo(() => selectExpandedMySkyView(sharedState), [sharedState]);

  const starpathRefs = useMemo(
    () => resolveStarpathReferencesFromSky(sharedState.graph.nodes),
    [sharedState.graph.nodes],
  );

  const pinObject = useCallback(async (objectId: string, objectType: FocusedSkyPinObjectType) => {
    setPins((current) => {
      const next = upsertPin(current, objectId, objectType);
      void saveFocusedSkyPins(next);
      return next;
    });
  }, []);

  const unpinObject = useCallback(async (objectId: string, objectType: FocusedSkyPinObjectType) => {
    setPins((current) => {
      const next = removePin(current, objectId, objectType);
      void saveFocusedSkyPins(next);
      return next;
    });
  }, []);

  return {
    sharedState,
    focusedView,
    expandedView,
    mySkyView,
    pins,
    scrollOffsetY,
    setScrollOffsetY,
    pinObject,
    unpinObject,
    starpathRefs,
  };
}
