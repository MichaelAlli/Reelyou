import { memo, useCallback, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  SkywriteFramedPhotoLayer,
  SkywritePhotoFramingToolbar,
  type SkywriteFramedPhotoLayerRef,
} from '@/components/skywrite/SkywriteFramedPhotoLayer';
import { SkywriteCopy } from '@/constants/skywriteCopy';
import { Fonts, Radius } from '@/constants/theme';
import {
  measureContainedVideoFrame,
  SKYWRITE_STORY_STAGE_ASPECT,
} from '@/skywrite/media/skywriteVideoLayout';
import type { SkywritePhotoMedia } from '@/skywrite/types';

interface SkywriteComposerPhotoPreviewProps {
  photo: SkywritePhotoMedia;
  previewWidth: number;
  onPhotoPatch: (patch: Partial<SkywritePhotoMedia>) => void;
}

function SkywriteComposerPhotoPreviewComponent({
  photo,
  previewWidth,
  onPhotoPatch,
}: SkywriteComposerPhotoPreviewProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustActive, setAdjustActive] = useState(false);
  const framingRef = useRef<SkywriteFramedPhotoLayerRef>(null);

  const inlineFrame = measureContainedVideoFrame(
    SKYWRITE_STORY_STAGE_ASPECT,
    previewWidth,
    Math.min(320, previewWidth * (16 / 9)),
  );

  const expandedFrame = measureContainedVideoFrame(
    SKYWRITE_STORY_STAGE_ASPECT,
    screenWidth - 32,
    screenHeight - 160,
  );

  const isLandscape =
    photo.width != null && photo.height != null && photo.width > photo.height * 1.05;

  const openAdjust = useCallback(() => setAdjustOpen(true), []);
  const closeAdjust = useCallback(() => {
    framingRef.current?.endAdjust();
    setAdjustOpen(false);
    setAdjustActive(false);
  }, []);

  return (
    <>
      <View style={[styles.inlineShell, { width: inlineFrame.width, height: inlineFrame.height }]}>
        <SkywriteFramedPhotoLayer
          photo={photo}
          fixedAspectStage={SKYWRITE_STORY_STAGE_ASPECT}
          showFitBackdrop
        />
        <Pressable style={styles.expandBtn} accessibilityLabel="Adjust photo framing" onPress={openAdjust}>
          <Text style={styles.expandBtnText}>{SkywriteCopy.photoFramingAdjustOpen}</Text>
        </Pressable>
      </View>
      {isLandscape && resolveStageFit(photo) === 'fit' ? (
        <Pressable
          style={styles.fillScreenLink}
          onPress={() => onPhotoPatch({ stageFit: 'fill' })}
          accessibilityRole="button">
          <Text style={styles.fillScreenLinkText}>{SkywriteCopy.photoFramingFillScreen}</Text>
        </Pressable>
      ) : null}

      <Modal visible={adjustOpen} animationType="slide" onRequestClose={closeAdjust}>
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{SkywriteCopy.photoFramingAdjustTitle}</Text>
            <Pressable onPress={closeAdjust} accessibilityRole="button">
              <Text style={styles.modalDone}>{SkywriteCopy.videoFramingDone}</Text>
            </Pressable>
          </View>
          <SkywritePhotoFramingToolbar
            photo={photo}
            editable
            adjustActive={adjustActive}
            onPhotoPatch={onPhotoPatch}
            onRequestAdjust={() => framingRef.current?.beginAdjust()}
            onRequestDone={() => framingRef.current?.endAdjust()}
          />
          <View style={[styles.stageWrap, { width: expandedFrame.width, height: expandedFrame.height }]}>
            <SkywriteFramedPhotoLayer
              ref={framingRef}
              photo={photo}
              editable
              showFitBackdrop
              onPhotoPatch={onPhotoPatch}
              onAdjustModeChange={setAdjustActive}
            />
          </View>
          <Text style={styles.modalHint}>{SkywriteCopy.photoFramingAdjustHint}</Text>
        </View>
      </Modal>
    </>
  );
}

function resolveStageFit(photo: SkywritePhotoMedia): 'fit' | 'fill' {
  return photo.stageFit === 'fill' ? 'fill' : 'fit';
}

export const SkywriteComposerPhotoPreview = memo(SkywriteComposerPhotoPreviewComponent);

const styles = StyleSheet.create({
  inlineShell: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#050508',
  },
  expandBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(8, 10, 28, 0.78)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(232, 200, 114, 0.45)',
  },
  expandBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    color: '#E8C872',
  },
  fillScreenLink: { alignSelf: 'flex-start', paddingVertical: 4 },
  fillScreenLinkText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#E8C872',
  },
  modalRoot: {
    flex: 1,
    backgroundColor: '#05070A',
    paddingTop: 48,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: Fonts.serif,
    fontSize: 18,
    color: '#FFF8F0',
    flex: 1,
    paddingRight: 8,
  },
  modalDone: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    color: '#E8C872',
  },
  stageWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#050508',
  },
  modalHint: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,248,240,0.65)',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});
