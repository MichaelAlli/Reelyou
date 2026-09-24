import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

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
import {
  loadSharedSkyAreas,
  registerSharedSkyArea,
} from '@/skyAreas/skyAreaSharedCatalog';

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
}

const SkyAreaPreferencesContext = createContext<SkyAreaPreferencesContextValue | null>(null);

export function SkyAreaPreferencesProvider({ children }: { children: ReactNode }) {
  const userId = currentUser.id;
  const [record, setRecord] = useState<SkyAreaPreferencesRecord>(() =>
    emptySkyAreaPreferences(userId),
  );
  const [sharedAreas, setSharedAreas] = useState<SkyArea[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    void Promise.all([loadSkyAreaPreferences(userId), loadSharedSkyAreas()]).then(
      ([loaded, shared]) => {
        if (mounted) {
          setRecord(loaded);
          setSharedAreas(shared);
          setIsLoaded(true);
        }
      },
    );
    return () => {
      mounted = false;
    };
  }, [userId]);

  const persist = useCallback((next: SkyAreaPreferencesRecord) => {
    setRecord(next);
    void saveSkyAreaPreferences(next);
  }, []);

  const catalog = useMemo(
    () => mergeSkyAreaCatalog(record.customAreas, sharedAreas),
    [record.customAreas, sharedAreas],
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
    }),
    [
      addCustomArea,
      catalog,
      filterCatalog,
      isLoaded,
      record,
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
