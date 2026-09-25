import { useLocalSearchParams } from 'expo-router';

import { resolveProfileRouteOwnerId } from '@/profile/resolveProfileRouteOwnerId';
import type { VisitorPreviewAs } from '@/profile/visitorProfilePreview';
import {
  resolveVisitorPreviewAsFromParams,
  resolveVisitorPreviewFromParams,
} from '@/profile/visitorProfileRoute';
import { VisitorProfileScreen } from '@/screens/VisitorProfileScreen';

export default function VisitorProfileRoute() {
  const params = useLocalSearchParams<{
    id?: string | string[];
    userId?: string | string[];
    preview?: string | string[];
    previewAs?: string | string[];
    viewerMode?: string | string[];
  }>();
  const ownerId =
    resolveProfileRouteOwnerId(params.id) ?? resolveProfileRouteOwnerId(params.userId);
  const visitorPreview = resolveVisitorPreviewFromParams(params.preview, params.viewerMode);
  const previewAs: VisitorPreviewAs | undefined = visitorPreview
    ? resolveVisitorPreviewAsFromParams(params.previewAs) ?? 'public'
    : undefined;

  return (
    <VisitorProfileScreen
      ownerId={ownerId}
      visitorPreview={visitorPreview}
      previewAccessMode={previewAs}
      key={`${ownerId ?? 'missing'}-${visitorPreview ? `preview-${previewAs ?? 'public'}` : 'visitor'}`}
    />
  );
}
