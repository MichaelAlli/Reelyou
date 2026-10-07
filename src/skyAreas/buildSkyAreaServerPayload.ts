import { MAX_CUSTOM_SKY_AREAS } from '@/skyAreas/skyAreaBetaConfig';
import type { SkyArea } from '@/skyAreas/skyAreaDefinition';
import { isEstablishedSkyArea } from '@/skyAreas/mapServerSkyAreaSummary';
import { parseCommaSeparatedSkyAreas } from '@/skyAreas/parseCommaSeparatedSkyAreas';
import { selectedSkyAreaIds } from '@/skyAreas/skyAreaPreferencesLogic';
import type { SkyAreaPreferencesRecord } from '@/skyAreas/skyAreaPreferencesTypes';

export function buildSkyAreaServerPayload(
  record: SkyAreaPreferencesRecord,
  catalog: readonly SkyArea[],
  commaInput: string,
): { ok: true; establishedIds: string[]; customLabels: string[] } | { ok: false; error: string } {
  const commaLabels = parseCommaSeparatedSkyAreas(commaInput);
  if (commaLabels.length > MAX_CUSTOM_SKY_AREAS) {
    return { ok: false, error: 'max_custom_sky_areas' };
  }

  const selectedIds = selectedSkyAreaIds(record);
  const selectedAreas = catalog.filter((area) => selectedIds.includes(area.id));
  const establishedIds = selectedAreas.filter((area) => isEstablishedSkyArea(area)).map((a) => a.id);

  const seen = new Set<string>();
  const customLabels: string[] = [];
  for (const area of selectedAreas) {
    if (isEstablishedSkyArea(area)) continue;
    const norm = area.normalizedLabel;
    if (seen.has(norm)) continue;
    seen.add(norm);
    customLabels.push(area.label);
  }
  for (const label of commaLabels) {
    const norm = label.trim().toLowerCase();
    if (seen.has(norm)) continue;
    seen.add(norm);
    customLabels.push(label);
  }

  return { ok: true, establishedIds, customLabels };
}
