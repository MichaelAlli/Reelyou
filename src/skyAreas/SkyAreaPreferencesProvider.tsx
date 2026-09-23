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
  addCustomArea: (label: string) => string | null;
  filterCatalog: (query: string) => SkyArea[];
}

const SkyAreaPreferencesContext = createContext<SkyAreaPreferencesContextValue | null>(null);

export function SkyAreaPreferencesProvider({ children }: { children: ReactNode }) {
  const userId = currentUser.id;
  const [record, setRecord] = useState<SkyAreaPreferencesRecord>(() =>
    emptySkyAreaPreferences(userId),
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    void loadSkyAreaPreferences(userId).then((loaded) => {
      if (mounted) {
        setRecord(loaded);
        setIsLoaded(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, [userId]);

  const persist = useCallback((next: SkyAreaPreferencesRecord) => {
    setRecord(next);
    void saveSkyAreaPreferences(next);
  }, []);

  const catalog = useMemo(() => mergeSkyAreaCatalog(record.customAreas), [record.customAreas]);

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
    (label: string) => {
      const result = addCustomSkyArea(record, label);
      if (result.error || !result.area) {
        return result.error ?? 'Unable to add area.';
      }
      persist(result.record);
      return null;
    },
    [persist, record],
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
