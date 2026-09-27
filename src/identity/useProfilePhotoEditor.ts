import { useCallback, useState } from 'react';
import { Image as RNImage, Platform } from 'react-native';

import { exportProfilePhotoWithCrop } from '@/identity/exportProfilePhotoCrop';
import type { ProfilePhotoPickResult } from '@/identity/profilePhotoActions';
import {
  DEFAULT_PROFILE_PHOTO_CROP_TRANSFORM,
  type ProfilePhotoCropImageSize,
  type ProfilePhotoCropTransform,
} from '@/identity/profilePhotoCropTypes';
import { useUserAvatar } from '@/identity/UserAvatarProvider';

export function useProfilePhotoEditor() {
  const userAvatar = useUserAvatar();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<ProfilePhotoCropImageSize | null>(null);
  const [cropTransform, setCropTransform] = useState<ProfilePhotoCropTransform>(
    DEFAULT_PROFILE_PHOTO_CROP_TRANSFORM,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openEditor = useCallback(() => {
    setFeedback(null);
    setPreviewUri(null);
    setImageSize(null);
    setCropTransform(DEFAULT_PROFILE_PHOTO_CROP_TRANSFORM);
    setSheetOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setSheetOpen(false);
    setPreviewUri(null);
    setImageSize(null);
    setCropTransform(DEFAULT_PROFILE_PHOTO_CROP_TRANSFORM);
    setFeedback(null);
    setSaving(false);
  }, []);

  const handlePickResult = useCallback((result: ProfilePhotoPickResult) => {
    if (!result.ok) {
      if (result.reason === 'cancelled') return;
      setFeedback(result.message ?? 'Could not use that photo.');
      return;
    }
    setFeedback(null);
    setCropTransform(DEFAULT_PROFILE_PHOTO_CROP_TRANSFORM);
    setImageSize(
      result.width && result.height ? { width: result.width, height: result.height } : null,
    );
    setPreviewUri(result.uri);
  }, []);

  const chooseLibrary = useCallback(async () => {
    handlePickResult(await userAvatar.pickFromLibrary());
  }, [handlePickResult, userAvatar]);

  const takePhoto = useCallback(async () => {
    handlePickResult(await userAvatar.takePhoto());
  }, [handlePickResult, userAvatar]);

  const resetCrop = useCallback(() => {
    setCropTransform(DEFAULT_PROFILE_PHOTO_CROP_TRANSFORM);
  }, []);

  const savePreview = useCallback(async () => {
    if (!previewUri || saving) return;
    setSaving(true);
    setFeedback(null);
    try {
      const size =
        imageSize ??
        (await resolveImageSizeFromUri(previewUri).catch(() => null));
      if (!size) {
        setFeedback('Could not read image size. Try another photo.');
        return;
      }
      const persisted = await exportProfilePhotoWithCrop({
        sourceUri: previewUri,
        imageSize: size,
        transform: cropTransform,
      });
      userAvatar.setProfilePhotoUri(persisted);
      closeEditor();
    } catch (error) {
      const message =
        error instanceof Error && error.message === 'too_large'
          ? 'That image is too large. Try a smaller photo.'
          : 'Could not save your profile picture. Try another image.';
      setFeedback(message);
    } finally {
      setSaving(false);
    }
  }, [closeEditor, cropTransform, imageSize, previewUri, saving, userAvatar]);

  const removePhoto = useCallback(() => {
    userAvatar.removeProfilePhoto();
    closeEditor();
  }, [closeEditor, userAvatar]);

  const discardPreview = useCallback(() => {
    setPreviewUri(null);
    setImageSize(null);
    setCropTransform(DEFAULT_PROFILE_PHOTO_CROP_TRANSFORM);
    setFeedback(null);
  }, []);

  return {
    sheetOpen,
    previewUri,
    imageSize,
    cropTransform,
    feedback,
    saving,
    hasPhoto: Boolean(userAvatar.profilePhotoUri),
    openEditor,
    closeEditor,
    chooseLibrary,
    takePhoto,
    savePreview,
    removePhoto,
    discardPreview,
    setImageSize,
    setCropTransform,
    resetCrop,
  };
}

async function resolveImageSizeFromUri(uri: string): Promise<ProfilePhotoCropImageSize> {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new document.defaultView!.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image_load_failed'));
      el.src = uri;
    });
    return { width: img.naturalWidth, height: img.naturalHeight };
  }
  return new Promise((resolve, reject) => {
    RNImage.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      () => reject(new Error('image_load_failed')),
    );
  });
}
