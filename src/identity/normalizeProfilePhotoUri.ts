import { Platform } from 'react-native';

import { PROFILE_PHOTO_MAX_BYTES } from '@/identity/profilePhotoActions';

/** AsyncStorage-safe target — base64 data URLs grow ~4/3 vs bytes. */
const MAX_PERSISTED_DATA_URL_CHARS = 2_800_000;
const MAX_EDGE_PX = 512;

/**
 * Converts transient web blob/object URLs (and oversized picks) into a storable data URL.
 * Native file/content URIs are kept as-is for Expo image loading.
 */
export async function normalizeProfilePhotoUriForPersistence(uri: string): Promise<string> {
  const trimmed = uri.trim();
  if (!trimmed) throw new Error('empty_uri');
  if (trimmed.startsWith('data:')) return trimmed;
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    return webPickToPersistedDataUrl(trimmed);
  }
  return trimmed;
}

async function webPickToPersistedDataUrl(uri: string): Promise<string> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error('fetch_failed');
  const blob = await response.blob();
  if (blob.size > PROFILE_PHOTO_MAX_BYTES) {
    throw new Error('too_large');
  }
  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = await loadHtmlImage(objectUrl);
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(img.naturalWidth, img.naturalHeight, 1));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas_unavailable');
    ctx.drawImage(img, 0, 0, width, height);

    let quality = 0.88;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    while (dataUrl.length > MAX_PERSISTED_DATA_URL_CHARS && quality > 0.52) {
      quality -= 0.08;
      dataUrl = canvas.toDataURL('image/jpeg', quality);
    }
    if (dataUrl.length > MAX_PERSISTED_DATA_URL_CHARS) {
      throw new Error('too_large');
    }
    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image_load_failed'));
    img.src = src;
  });
}
