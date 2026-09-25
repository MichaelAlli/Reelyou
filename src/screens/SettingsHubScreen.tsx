import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { Fonts } from '@/constants/theme';
import { useThemeContext } from '@/theme/ThemeProvider';
import type { ThemeMode } from '@/theme/types';

export function SettingsHubScreen() {
  const router = useRouter();
  const { preferences, updatePreferences } = useReelyouConnect();
  const { themeMode, setThemeMode } = useThemeContext();

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back">
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Signals & Notifications">
          <ToggleRow
            label="Direct message signals"
            value={preferences.signalPreferences.messages}
            onValueChange={(v) => updatePreferences({ signalPreferences: { messages: v } })}
          />
          <ToggleRow
            label="Opportunity signals"
            value={preferences.signalPreferences.opportunities}
            onValueChange={(v) => updatePreferences({ signalPreferences: { opportunities: v } })}
          />
          <ToggleRow
            label="Connection signals"
            value={preferences.signalPreferences.connections}
            onValueChange={(v) => updatePreferences({ signalPreferences: { connections: v } })}
          />
          <ToggleRow
            label="Community signals"
            value={preferences.signalPreferences.communities}
            onValueChange={(v) => updatePreferences({ signalPreferences: { communities: v } })}
          />
          <ToggleRow
            label="Sky activity signals"
            value={preferences.signalPreferences.skyActivity}
            onValueChange={(v) => updatePreferences({ signalPreferences: { skyActivity: v } })}
          />
          <ToggleRow
            label="Quiet mode"
            value={preferences.signalPreferences.quietMode}
            onValueChange={(v) => updatePreferences({ signalPreferences: { quietMode: v } })}
          />
        </Section>

        <Section title="Messaging">
          <LinkRow label="Who can message me" hint={preferences.messagingPreferences.whoCanMessage.replace('_', ' ')} onPress={() => router.push('/settings/messaging' as never)} />
          <ToggleRow
            label="Show message preview in Signal Center"
            value={preferences.signalPreferences.showMessagePreview}
            onValueChange={(v) => updatePreferences({ signalPreferences: { showMessagePreview: v } })}
          />
          <ToggleRow
            label="Mute message signals"
            value={preferences.messagingPreferences.muteMessageSignals}
            onValueChange={(v) => updatePreferences({ messagingPreferences: { muteMessageSignals: v } })}
          />
        </Section>

        <Section title="Your Guide">
          <LinkRow label="Guide intensity" hint={preferences.guidePreferences.mode} onPress={() => router.push('/settings/guide' as never)} />
          <ToggleRow
            label="Opportunity nudges"
            value={preferences.guidePreferences.opportunityNudges}
            onValueChange={(v) => updatePreferences({ guidePreferences: { opportunityNudges: v } })}
          />
        </Section>

        <Section title="Personalization">
          <ToggleRow
            label="Use activity to adjust guidance intensity"
            value={preferences.emotionalContextPreference.adjustGuidanceIntensity}
            onValueChange={(v) =>
              updatePreferences({ emotionalContextPreference: { adjustGuidanceIntensity: v } })
            }
          />
          <LinkRow label="Discovery preferences" onPress={() => router.push('/settings/discovery' as never)} />
          <LinkRow
            label="Personalization preferences"
            onPress={() => router.push('/settings/personalization' as never)}
          />
          <LinkRow
            label="Where I Live in the Sky"
            onPress={() => router.push('/settings/where-you-live' as never)}
          />
        </Section>

        <Section title="Theme">
          {(['light', 'dark', 'system', 'timeOfDay'] as ThemeMode[]).map((mode) => (
            <Pressable
              key={mode}
              style={styles.linkRow}
              onPress={() => setThemeMode(mode)}
              accessibilityLabel={`Theme ${mode}`}
            >
              <Text style={styles.linkText}>{mode}</Text>
              {themeMode === mode ? <Text style={styles.check}>✓</Text> : null}
            </Pressable>
          ))}
        </Section>

        <Section title="Privacy & Safety">
          <LinkRow label="Privacy & Visibility" onPress={() => router.push('/settings/privacy' as never)} />
          <LinkRow
            label="Connected Skies"
            onPress={() => router.push('/sky-friends' as never)}
          />
          <LinkRow label="Blocked people" onPress={() => router.push('/settings/blocked' as never)} />
          <LinkRow label="Limited people" onPress={() => router.push('/settings/limited' as never)} />
        </Section>

        <Section title="Support">
          <LinkRow label="Help & Support" onPress={() => router.push('/settings/help' as never)} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} accessibilityLabel={label} />
    </View>
  );
}

function LinkRow({
  label,
  hint,
  onPress,
}: {
  label: string;
  hint?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.linkRow} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={styles.linkText}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  back: { fontFamily: Fonts.sans, color: '#E8C872', fontWeight: '600' },
  title: { flex: 1, textAlign: 'center', fontFamily: Fonts.serif, color: '#F5F0FF', fontSize: 20 },
  spacer: { width: 48 },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  section: { gap: 8 },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(235,228,248,0.55)',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: 6,
  },
  toggleLabel: { flex: 1, fontFamily: Fonts.sans, color: '#F5F0FF', fontSize: 14, paddingRight: 12 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingVertical: 8,
  },
  linkText: { fontFamily: Fonts.sans, color: '#F5F0FF', fontSize: 14 },
  hint: { fontFamily: Fonts.sans, fontSize: 12, color: 'rgba(235,228,248,0.55)' },
  check: { color: '#E8C872', fontWeight: '700' },
});
