import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';
import { isExplicitDevDemoModeEnabled } from '@/auth/demoMode';
import { resolveActiveUserId } from '@/auth/resolveActiveUserId';
import { currentUser } from '@/data/mockData';
import { mergeSkyAreaCatalog, type SkyArea } from '@/skyAreas/skyAreaDefinition';
import {
  addCustomSkyArea,
  filterCatalogByQuery,
  isSkyAreaSelected,
  selectedSkyAreaIds,
  setPauseAllContributionBeacons,
  setSkyAreaBeaconEnabled,
  setStillDiscovering,
  toggleSkyAreaSelection,
} from '@/skyAreas/skyAreaPreferencesLogic';
import {
  loadSkyAreaPreferences,
  saveSkyAreaPreferences,
} from '@/skyAreas/skyAreaPreferencesPersistence';
import {
  emptySkyAreaPreferences,
  type SkyAreaPreferencesRecord,
} from '@/skyAreas/skyAreaPreferencesTypes';
import { buildSkyAreaServerPayload } from '@/skyAreas/buildSkyAreaServerPayload';
import { MAX_CUSTOM_SKY_AREAS } from '@/skyAreas/skyAreaBetaConfig';
import { isEstablishedSkyArea, mapServerSkyAreaSummary } from '@/skyAreas/mapServerSkyAreaSummary';
import { parseCommaSeparatedSkyAreas } from '@/skyAreas/parseCommaSeparatedSkyAreas';
import {
  fetchMySkyAreas,
  fetchSkyAreaCatalog,
  saveMySkyAreas,
} from '@/skyAreas/serverSkyAreaApi';
import {
  loadSharedSkyAreas,
  registerSharedSkyArea,
} from '@/skyAreas/skyAreaSharedCatalog';
import { isReelyouAuthConfigured } from '@/auth/reellyouAuthConfig';

interface AddCustomAreaResult {
  error: string | null;
  areaId: string | null;
}

interface SkyAreaPreferencesContextValue {
  isLoaded: boolean;
  record: SkyAreaPreferencesRecord;
  catalog: SkyArea[];
  selectedIds: string[];
  isAreaSelected: (skyAreaId: string) => boolean;
  toggleAreaSelection: (skyAreaId: string) => void;
  setBeaconEnabled: (skyAreaId: string, enabled: boolean) => void;
  setPauseAllBeacons: (paused: boolean) => void;
  setDiscovering: (discovering: boolean) => void;
  addCustomArea: (label: string) => AddCustomAreaResult;
  filterCatalog: (query: string) => SkyArea[];
  establishedAreas: SkyArea[];
  saveSkyAreaSelectionToServer: (commaInput?: string) => Promise<{ ok: boolean; error?: string }>;
}

const SkyAreaPreferencesContext = createContext<SkyAreaPreferencesContextValue | null>(null);

export function SkyAreaPreferencesProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useReelyouAuth();
  const userId =
    resolveActiveUserId(authUser) ??
    (isExplicitDevDemoModeEnabled() ? currentUser.id : '');
  const [record, setRecord] = useState<SkyAreaPreferencesRecord>(() =>
    emptySkyAreaPreferences(userId || 'anonymous'),
  );
  const [sharedAreas, setSharedAreas] = useState<SkyArea[]>([]);
  const [serverCatalog, setServerCatalog] = useState<SkyArea[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    void Promise.all([
      loadSkyAreaPreferences(userId),
      loadSharedSkyAreas(),
      fetchSkyAreaCatalog(),
      isReelyouAuthConfigured() && userId ? fetchMySkyAreas() : Promise.resolve(null),
    ]).then(([loaded, shared, catalogRows, mine]) => {
      if (!mounted) return;
      const fromServer = catalogRows.map(mapServerSkyAreaSummary);
      setServerCatalog(fromServer);
      let nextRecord = loaded;
      if (mine && mine.skyAreaIds.length > 0) {
        for (const id of mine.skyAreaIds) {
          if (!isSkyAreaSelected(nextRecord, id)) {
            nextRecord = toggleSkyAreaSelection(nextRecord, id);
          }
        }
      }
      setRecord(nextRecord);
      setSharedAreas([...shared, ...fromServer.filter((area) => area.source === 'custom')]);
      setIsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, [userId]);

  const persist = useCallback((next: SkyAreaPreferencesRecord) => {
    setRecord(next);
    void saveSkyAreaPreferences(next);
  }, []);

  const catalog = useMemo(() => {
    const mergedShared = [...sharedAreas];
    for (const area of serverCatalog) {
      if (!mergedShared.some((entry) => entry.id === area.id)) mergedShared.push(area);
    }
    return mergeSkyAreaCatalog(record.customAreas, mergedShared);
  }, [record.customAreas, serverCatalog, sharedAreas]);

  const establishedAreas = useMemo(
    () => catalog.filter((area) => isEstablishedSkyArea(area)),
    [catalog],
  );

  const toggleAreaSelection = useCallback(
    (skyAreaId: string) => {
      persist(toggleSkyAreaSelection(record, skyAreaId));
    },
    [persist, record],
  );

  const setBeaconEnabled = useCallback(
    (skyAreaId: string, enabled: boolean) => {
      persist(setSkyAreaBeaconEnabled(record, skyAreaId, enabled));
    },
    [persist, record],
  );

  const setPauseAllBeacons = useCallback(
    (paused: boolean) => {
      persist(setPauseAllContributionBeacons(record, paused));
    },
    [persist, record],
  );

  const setDiscovering = useCallback(
    (discovering: boolean) => {
      persist(setStillDiscovering(record, discovering));
    },
    [persist, record],
  );

  const addCustomArea = useCallback(
    (label: string): AddCustomAreaResult => {
      const result = addCustomSkyArea(record, label, catalog, sharedAreas, userId);
      if (result.error || !result.area) {
        return { error: result.error ?? 'Unable to add area.', areaId: null };
      }
      persist(result.record);
      if (!result.reused && result.area.source === 'custom') {
        void registerSharedSkyArea(result.area).then(setSharedAreas);
      }
      return { error: null, areaId: result.area.id };
    },
    [catalog, persist, record, sharedAreas, userId],
  );

  const filterCatalog = useCallback(
    (query: string) => filterCatalogByQuery(catalog, query),
    [catalog],
  );

  const saveSkyAreaSelectionToServer = useCallback(
    async (commaInput = '') => {
      if (!isReelyouAuthConfigured() || !userId) return { ok: true };
      let working = record;
      const labels = parseCommaSeparatedSkyAreas(commaInput);
      if (labels.length > MAX_CUSTOM_SKY_AREAS) return { ok: false, error: 'max_custom_sky_areas' };
      for (const label of labels) {
        const result = addCustomSkyArea(working, label, catalog, sharedAreas, userId);
        if (result.error || !result.area) {
          return { ok: false, error: result.error ?? 'unable_to_add_area' };
        }
        working = result.record;
      }
      if (working !== record) {
        persist(working);
      }
      const payload = buildSkyAreaServerPayload(working, catalog, '');
      if (!payload.ok) return { ok: false, error: payload.error };
      const saved = await saveMySkyAreas({
        establishedIds: payload.establishedIds,
        customLabels: payload.customLabels,
      });
      if (!saved.ok) return { ok: false, error: saved.error };
      const refreshed = await fetchSkyAreaCatalog();
      setServerCatalog(refreshed.map(mapServerSkyAreaSummary));
      return { ok: true };
    },
    [catalog, persist, record, sharedAreas, userId],
  );

  const value = useMemo<SkyAreaPreferencesContextValue>(
    () => ({
      isLoaded,
      record,
      catalog,
      selectedIds: selectedSkyAreaIds(record),
      isAreaSelected: (skyAreaId: string) => isSkyAreaSelected(record, skyAreaId),
      toggleAreaSelection,
      setBeaconEnabled,
      setPauseAllBeacons,
      setDiscovering,
      addCustomArea,
      filterCatalog,
      establishedAreas,
      saveSkyAreaSelectionToServer,
    }),
    [
      addCustomArea,
      catalog,
      establishedAreas,
      filterCatalog,
      isLoaded,
      record,
      saveSkyAreaSelectionToServer,
      setBeaconEnabled,
      setDiscovering,
      setPauseAllBeacons,
      toggleAreaSelection,
    ],
  );

  return (
    <SkyAreaPreferencesContext.Provider value={value}>{children}</SkyAreaPreferencesContext.Provider>
  );
}

export function useSkyAreaPreferences(): SkyAreaPreferencesContextValue {
  const ctx = useContext(SkyAreaPreferencesContext);
  if (!ctx) {
    throw new Error('useSkyAreaPreferences must be used within SkyAreaPreferencesProvider');
  }
  return ctx;
}
