import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { SkywriteCopy } from '@/constants/skywriteCopy';
import type { SkywriteAudioMedia, SkywritePhotoMedia } from '@/skywrite/types';

export type PhotoPickFailureReason = 'cancelled' | 'denied' | 'unavailable';

export type PhotoPickResult =
  | { ok: true; photo: SkywritePhotoMedia }
  | { ok: false; reason: PhotoPickFailureReason; message?: string };

function assetToPhoto(asset: ImagePicker.ImagePickerAsset): SkywritePhotoMedia {
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
  };
}

export async function pickSkywritePhotoFromLibrary(): Promise<PhotoPickResult> {
  if (Platform.OS === 'web') {
    return pickPhotoWeb(false);
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return {
      ok: false,
      reason: 'denied',
      message: SkywriteCopy.photoLibraryDenied,
    };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) {
    return { ok: false, reason: 'cancelled' };
  }

  return { ok: true, photo: assetToPhoto(result.assets[0]) };
}

export async function takeSkywritePhoto(): Promise<PhotoPickResult> {
  if (Platform.OS === 'web') {
    return pickPhotoWeb(true);
  }

  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return {
      ok: false,
      reason: 'denied',
      message: SkywriteCopy.cameraDenied,
    };
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) {
    return { ok: false, reason: 'cancelled' };
  }

  return { ok: true, photo: assetToPhoto(result.assets[0]) };
}

function pickPhotoWeb(useCamera: boolean): Promise<PhotoPickResult> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve({ ok: false, reason: 'unavailable', message: SkywriteCopy.photoWebUnavailable });
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (useCamera) {
      input.setAttribute('capture', 'environment');
    }
    input.style.display = 'none';

    const cleanup = () => {
      if (input.parentNode) document.body.removeChild(input);
    };

    input.onchange = () => {
      const file = input.files?.[0];
      cleanup();
      if (!file) {
        resolve({ ok: false, reason: 'cancelled' });
        return;
      }
      resolve({ ok: true, photo: { uri: URL.createObjectURL(file) } });
    };

    input.oncancel = () => {
      cleanup();
      resolve({ ok: false, reason: 'cancelled' });
    };

    document.body.appendChild(input);
    input.click();
  });
}

/** @deprecated Use pickSkywritePhotoFromLibrary or takeSkywritePhoto */
export async function pickSkywritePhoto(): Promise<SkywritePhotoMedia | null> {
  const result = await pickSkywritePhotoFromLibrary();
  return result.ok ? result.photo : null;
}

export async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      return false;
    }
  }

  try {
    const { Audio } = await import('expo-av');
    const permission = await Audio.requestPermissionsAsync();
    return permission.granted;
  } catch {
    return false;
  }
}

export function formatDurationMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Web-only MediaRecorder session — native uses expo-av in the voice hook. */
export class WebVoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private startedAt = 0;

  async start(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.chunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.startedAt = Date.now();
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.chunks.push(event.data);
      };
      this.mediaRecorder.start();
      return true;
    } catch {
      return false;
    }
  }

  async stop(): Promise<SkywriteAudioMedia | null> {
    const recorder = this.mediaRecorder;
    if (!recorder) return null;

    return new Promise((resolve) => {
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(this.chunks, { type: recorder.mimeType || 'audio/webm' });
        const uri = URL.createObjectURL(blob);
        resolve({
          uri,
          durationMs: Date.now() - this.startedAt,
        });
      };
      recorder.stop();
      this.mediaRecorder = null;
    });
  }

  cancel(): void {
    const recorder = this.mediaRecorder;
    if (!recorder) return;
    recorder.stream.getTracks().forEach((track) => track.stop());
    recorder.stop();
    this.mediaRecorder = null;
    this.chunks = [];
  }
}
