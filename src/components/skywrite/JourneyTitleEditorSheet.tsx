import { memo, useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CalmOverlaySheet } from '@/components/focused-sky/CalmOverlaySheet';
import { MySkywritesCopy } from '@/constants/mySkywritesCopy';
import { SkywritePlayCopy } from '@/constants/skywritePlayCopy';
import { Fonts, Radius } from '@/constants/theme';
import { usePersonalJourney } from '@/journey/PersonalJourneyProvider';
import { sanitizeJourneyCustomTitle } from '@/journey/personalJourneyTitle';

interface JourneyTitleEditorSheetProps {
  visible: boolean;
  onClose: () => void;
}

function JourneyTitleEditorSheetComponent({ visible, onClose }: JourneyTitleEditorSheetProps) {
  const { settings, saveCustomTitle, displayTitle } = usePersonalJourney();
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDraft(settings.customTitle ?? '');
      setError(null);
    }
  }, [settings.customTitle, visible]);

  const handleSave = useCallback(async () => {
    const sanitized = sanitizeJourneyCustomTitle(draft);
    if (!sanitized && draft.trim()) {
      setError(MySkywritesCopy.journeyTitleInvalid);
      return;
    }
    setSaving(true);
    const ok = await saveCustomTitle(sanitized || null);
    setSaving(false);
    if (ok) onClose();
    else setError(MySkywritesCopy.journeyTitleSaveFailed);
  }, [draft, onClose, saveCustomTitle]);

  const handleClear = useCallback(async () => {
    setSaving(true);
    const ok = await saveCustomTitle(null);
    setSaving(false);
    if (ok) onClose();
  }, [onClose, saveCustomTitle]);

  return (
    <CalmOverlaySheet visible={visible} onClose={onClose} backdropLabel={SkywritePlayCopy.close}>
      <View style={styles.panel}>
        <Text style={styles.title}>{MySkywritesCopy.editJourneyNameTitle}</Text>
        <Text style={styles.preview}>{displayTitle}</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={MySkywritesCopy.journeyTitlePlaceholder}
          placeholderTextColor="rgba(248,244,236,0.35)"
          style={styles.input}
          maxLength={80}
          accessibilityLabel={MySkywritesCopy.journeyTitlePlaceholder}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.actions}>
          <Pressable onPress={onClose} style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>{SkywritePlayCopy.close}</Text>
          </Pressable>
          <Pressable onPress={() => void handleClear()} disabled={saving} style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>{MySkywritesCopy.resetJourneyTitle}</Text>
          </Pressable>
          <Pressable onPress={() => void handleSave()} disabled={saving} style={styles.primaryBtn}>
            {saving ? (
              <ActivityIndicator color="#F5E6B8" />
            ) : (
              <Text style={styles.primaryText}>{MySkywritesCopy.saveJourneyTitle}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </CalmOverlaySheet>
  );
}

export const JourneyTitleEditorSheet = memo(JourneyTitleEditorSheetComponent);

const styles = StyleSheet.create({
  panel: {
    borderRadius: 18,
    backgroundColor: 'rgba(8, 10, 28, 0.96)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.22)',
    padding: 16,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    color: '#F5F0FF',
    textAlign: 'center',
  },
  preview: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: 'rgba(232, 200, 114, 0.85)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  input: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: '#F5F0FF',
    borderWidth: 1,
    borderColor: 'rgba(196, 168, 255, 0.35)',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  error: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: '#ffb4b4',
    marginTop: 8,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  secondaryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(196, 168, 255, 0.35)',
  },
  secondaryText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '600',
    color: '#C4A8FF',
  },
  primaryBtn: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(232, 200, 114, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.45)',
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: '#F5E6B8',
  },
});
