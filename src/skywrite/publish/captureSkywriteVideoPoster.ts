import { Platform } from 'react-native';

const POSTER_SEEK_MS = [1000, 500, 2000, 0];

function isLikelyBlankCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): boolean {
  if (width <= 0 || height <= 0) return true;
  const sample = ctx.getImageData(0, 0, Math.min(32, width), Math.min(32, height)).data;
  let sum = 0;
  for (let i = 0; i < sample.length; i += 4) {
    sum += sample[i]! + sample[i + 1]! + sample[i + 2]!;
  }
  const avg = sum / (sample.length / 4) / 3;
  return avg < 8;
}

async function captureWebVideoPoster(uri: string, seekMs: number): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    const timeout = setTimeout(() => {
      video.src = '';
      resolve(null);
    }, 14_000);

    const finish = (result: string | null) => {
      clearTimeout(timeout);
      video.src = '';
      resolve(result);
    };

    video.onerror = () => finish(null);
    video.onloadedmetadata = () => {
      const durSec = Number.isFinite(video.duration) ? video.duration : 0;
      const seekSec = durSec > 0 ? Math.min(seekMs / 1000, Math.max(0, durSec - 0.05)) : seekMs / 1000;
      try {
        video.currentTime = seekSec;
      } catch {
        finish(null);
      }
    };
    video.onseeked = () => {
      try {
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 360;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          finish(null);
          return;
        }
        ctx.drawImage(video, 0, 0, w, h);
        if (isLikelyBlankCanvas(ctx, w, h)) {
          finish(null);
          return;
        }
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              finish(null);
              return;
            }
            finish(URL.createObjectURL(blob));
          },
          'image/jpeg',
          0.82,
        );
      } catch {
        finish(null);
      }
    };
    video.src = uri;
    video.load();
  });
}

/** Representative still frame for library cards — avoids black opening frames when possible. */
export async function captureSkywriteVideoPosterUri(videoUri: string): Promise<string | null> {
  if (!videoUri) return null;

  if (Platform.OS === 'web') {
    for (const seekMs of POSTER_SEEK_MS) {
      const uri = await captureWebVideoPoster(videoUri, seekMs);
      if (uri) return uri;
    }
    return null;
  }

  try {
    const VideoThumbnails = await import('expo-video-thumbnails');
    for (const seekMs of POSTER_SEEK_MS) {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: seekMs,
        quality: 0.72,
      });
      if (uri) return uri;
    }
  } catch {
    return null;
  }
  return null;
}
