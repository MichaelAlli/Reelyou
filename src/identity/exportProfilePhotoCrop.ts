import { Platform } from 'react-native';

import { normalizeProfilePhotoUriForPersistence } from '@/identity/normalizeProfilePhotoUri';
import {
  PROFILE_PHOTO_CROP_OUTPUT_PX,
  PROFILE_PHOTO_CROP_VIEWPORT_PX,
  type ProfilePhotoCropImageSize,
  type ProfilePhotoCropTransform,
  computeProfilePhotoCoverScale,
} from '@/identity/profilePhotoCropTypes';

const MAX_PERSISTED_DATA_URL_CHARS = 2_800_000;

/**
 * Bakes pan/zoom into a square JPEG data URL so every surface shows the same crop.
 */
export async function exportProfilePhotoWithCrop(input: {
  sourceUri: string;
  imageSize: ProfilePhotoCropImageSize;
  transform: ProfilePhotoCropTransform;
}): Promise<string> {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    return exportProfilePhotoWithCropWeb(input);
  }
  return normalizeProfilePhotoUriForPersistence(input.sourceUri);
}

async function exportProfilePhotoWithCropWeb(input: {
  sourceUri: string;
  imageSize: ProfilePhotoCropImageSize;
  transform: ProfilePhotoCropTransform;
}): Promise<string> {
  const img = await loadHtmlImage(input.sourceUri);
  const viewport = PROFILE_PHOTO_CROP_VIEWPORT_PX;
  const output = PROFILE_PHOTO_CROP_OUTPUT_PX;
  const cover = computeProfilePhotoCoverScale(input.imageSize, viewport);
  const displayScale = cover * input.transform.userScale;
  const w = input.imageSize.width;
  const h = input.imageSize.height;
  const drawW = w * displayScale;
  const drawH = h * displayScale;
  const left = viewport / 2 - drawW / 2 + input.transform.offsetX;
  const top = viewport / 2 - drawH / 2 + input.transform.offsetY;

  const canvas = document.createElement('canvas');
  canvas.width = output;
  canvas.height = output;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');

  const factor = output / viewport;
  ctx.fillStyle = '#080818';
  ctx.fillRect(0, 0, output, output);
  ctx.save();
  ctx.beginPath();
  ctx.arc(output / 2, output / 2, output / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, left * factor, top * factor, drawW * factor, drawH * factor);
  ctx.restore();

  let quality = 0.9;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  while (dataUrl.length > MAX_PERSISTED_DATA_URL_CHARS && quality > 0.52) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }
  if (dataUrl.length > MAX_PERSISTED_DATA_URL_CHARS) {
    throw new Error('too_large');
  }
  return dataUrl;
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image_load_failed'));
    img.src = src;
  });
}
