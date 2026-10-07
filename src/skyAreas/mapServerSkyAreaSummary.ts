import type { SkyArea } from '@/skyAreas/skyAreaDefinition';
import { isSkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';
import { normalizeSkyAreaLabel, skyAreaSlugFromLabel } from '@/skyAreas/skyAreaNormalization';
import type { ServerSkyAreaSummary } from '@/skyAreas/serverSkyAreaApi';

export function mapServerSkyAreaSummary(area: ServerSkyAreaSummary): SkyArea {
  const isDefault = isSkyAreaCategoryId(area.id);
  return {
    id: area.id,
    label: area.label,
    normalizedLabel: area.normalizedName || normalizeSkyAreaLabel(area.label),
    slug: isDefault ? area.id : skyAreaSlugFromLabel(area.label),
    icon: 'community',
    source: isDefault ? 'default' : 'custom',
    createdByUser: area.status === 'emerging',
    catalogStatus: area.status,
    moderationStatus: 'active',
    sortOrder: area.sortOrder,
    active: area.status !== 'hidden',
    createdAt: area.promotedAt ?? 0,
    updatedAt: area.promotedAt ?? 0,
  };
}

export function isEstablishedSkyArea(area: SkyArea): boolean {
  return area.source === 'default' || area.catalogStatus === 'established';
}
