import { Platform } from 'react-native';

import { isQaPreviewQueryActive } from '@/config/qaPreviewFlags';

/** Skip writing tutorial / tip dismissal while reviewing screens from the QA gallery. */
export function shouldSuppressQaPreviewPersistence(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }
  try {
    const params = new URLSearchParams(window.location.search);
    return isQaPreviewQueryActive(params.get('qaPreview') ?? undefined);
  } catch {
    return false;
  }
}
