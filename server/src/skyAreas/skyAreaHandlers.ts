import {
  getUserSkyAreaSelection,
  listSkyAreasForCatalog,
  setUserSkyAreaSelection,
  type StoredSkyArea,
} from './skyAreaRepository.js';

function areaForClient(area: StoredSkyArea) {
  return {
    id: area.id,
    label: area.canonicalName,
    normalizedName: area.normalizedName,
    status: area.status,
    uniqueUserCount: area.uniqueUserCount,
    promotedAt: area.promotedAt,
    sortOrder: area.sortOrder,
  };
}

export function handleGetSkyAreaCatalog(search?: string, establishedOnly?: boolean) {
  const areas = listSkyAreasForCatalog({ search, establishedOnly, limit: 80 });
  return { ok: true as const, areas: areas.map(areaForClient) };
}

export function handleGetMySkyAreas(userId: string) {
  const selection = getUserSkyAreaSelection(userId);
  return {
    ok: true as const,
    skyAreaIds: selection.skyAreaIds,
    areas: selection.areas.map(areaForClient),
  };
}

export function handlePutMySkyAreas(
  userId: string,
  body: { establishedIds?: string[]; customLabels?: string[] },
) {
  const establishedIds = Array.isArray(body.establishedIds) ? body.establishedIds : [];
  const customLabels = Array.isArray(body.customLabels) ? body.customLabels : [];
  const result = setUserSkyAreaSelection(userId, { establishedIds, customLabels });
  if (!result.ok) {
    return { ok: false as const, error: result.error };
  }
  return {
    ok: true as const,
    skyAreaIds: result.skyAreaIds,
    areas: result.areas.map(areaForClient),
  };
}
