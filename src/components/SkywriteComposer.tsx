import { GlassCard } from '@/components/GlassCard';
import { GlowButton } from '@/components/GlowButton';
import { CosmicTheme, Fonts, Radius, Spacing } from '@/constants/theme';
import { moods, privacyOptions, skywriteTags } from '@/data/mockData';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Mood, Privacy, SkywriteTag } from '@/types';

interface SkywriteComposerProps {
  onSubmit: () => void;
}

export function SkywriteComposer({ onSubmit }: SkywriteComposerProps) {
  const [text, setText] = useState('');
  const [mood, setMood] = useState<Mood>('reflective');
  const [selectedTags, setSelectedTags] = useState<SkywriteTag[]>([]);
  const [privacy, setPrivacy] = useState<Privacy>('orbit');

  const toggleTag = (tag: SkywriteTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>What&apos;s on your heart?</Text>
      <TextInput
        style={styles.input}
        placeholder="Share your reflection..."
        placeholderTextColor={CosmicTheme.textMuted}
        multiline
        value={text}
        onChangeText={setText}
      />

      <Text style={styles.sectionLabel}>Mood</Text>
      <View style={styles.row}>
        {moods.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => setMood(m.id as Mood)}
            style={[styles.moodChip, mood === m.id && styles.moodChipActive]}>
            <Text style={styles.moodEmoji}>{m.emoji}</Text>
            <Text style={[styles.chipText, mood === m.id && styles.chipTextActive]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Tags</Text>
      <View style={styles.wrap}>
        {skywriteTags.map((tag) => (
          <Pressable
            key={tag}
            onPress={() => toggleTag(tag)}
            style={[styles.tagChip, selectedTags.includes(tag) && styles.tagChipActive]}>
            <Text style={[styles.chipText, selectedTags.includes(tag) && styles.chipTextActive]}>
              {tag}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Privacy</Text>
      <View style={styles.privacyRow}>
        {privacyOptions.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => setPrivacy(option.id as Privacy)}
            style={[styles.privacyChip, privacy === option.id && styles.privacyChipActive]}>
            <Text style={[styles.privacyLabel, privacy === option.id && styles.chipTextActive]}>
              {option.label}
            </Text>
            <Text style={styles.privacyDesc}>{option.description}</Text>
          </Pressable>
        ))}
      </View>

      <GlowButton label="Release Skywrite" onPress={onSubmit} style={styles.submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 20,
    fontWeight: '700',
    color: CosmicTheme.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: CosmicTheme.backgroundElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: CosmicTheme.cardBorder,
    padding: Spacing.md,
    minHeight: 120,
    color: CosmicTheme.textPrimary,
    fontFamily: Fonts.sans,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: CosmicTheme.gold,
    marginTop: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: CosmicTheme.backgroundElevated,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  moodChipActive: {
    borderColor: CosmicTheme.gold,
    backgroundColor: CosmicTheme.goldMuted,
  },
  tagChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: CosmicTheme.backgroundElevated,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagChipActive: {
    borderColor: CosmicTheme.purple,
    backgroundColor: CosmicTheme.purpleSoft,
  },
  chipText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: CosmicTheme.textSecondary,
  },
  chipTextActive: {
    color: CosmicTheme.textPrimary,
    fontWeight: '600',
  },
  moodEmoji: {
    fontSize: 14,
  },
  privacyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  privacyChip: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: CosmicTheme.backgroundElevated,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  privacyChipActive: {
    borderColor: CosmicTheme.gold,
    backgroundColor: CosmicTheme.goldMuted,
  },
  privacyLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    color: CosmicTheme.textSecondary,
  },
  privacyDesc: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    color: CosmicTheme.textMuted,
    marginTop: 2,
  },
  submit: {
    marginTop: Spacing.lg,
  },
});
