import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useReelyouConnect } from '@/connect/ReelyouConnectProvider';
import { Fonts } from '@/constants/theme';
import type { WhoCanMessage } from '@/preferences/userPreferencesTypes';
import { useOnboarding } from '@/onboarding';

export function SettingsSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const router = useRouter();
  const { preferences, updatePreferences } = useReelyouConnect();
  const onboarding = useOnboarding();

  const title =
    section === 'messaging'
      ? 'Messaging'
      : section === 'guide'
        ? 'Your Guide'
        : section === 'discovery'
          ? 'Discovery'
          : section === 'personalization'
            ? 'Personalization'
            : section === 'privacy'
              ? 'Privacy & Visibility'
              : section === 'help'
                ? 'Help & Support'
                : 'Settings';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back">
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {section === 'messaging' ? (
          (['connections_only', 'message_requests', 'nobody'] as WhoCanMessage[]).map((opt) => (
            <Pressable
              key={opt}
              style={styles.row}
              onPress={() => updatePreferences({ messagingPreferences: { whoCanMessage: opt } })}
            >
              <Text style={styles.rowText}>{opt.replace(/_/g, ' ')}</Text>
              {preferences.messagingPreferences.whoCanMessage === opt ? (
                <Text style={styles.check}>✓</Text>
              ) : null}
            </Pressable>
          ))
        ) : null}

        {section === 'guide' ? (
          <>
            {(['on', 'reduced', 'off'] as const).map((mode) => (
              <Pressable
                key={mode}
                style={styles.row}
                onPress={() => updatePreferences({ guidePreferences: { mode } })}
              >
                <Text style={styles.rowText}>{mode}</Text>
                {preferences.guidePreferences.mode === mode ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>
            ))}
            <Pressable
              style={styles.row}
              onPress={() =>
                updatePreferences({
                  guidePreferences: {
                    reflectionPrompts: !preferences.guidePreferences.reflectionPrompts,
                  },
                })
              }
            >
              <Text style={styles.rowText}>Reflection prompts</Text>
              <Text style={styles.check}>
                {preferences.guidePreferences.reflectionPrompts ? '✓' : ''}
              </Text>
            </Pressable>
            <Pressable
              style={styles.row}
              onPress={() =>
                updatePreferences({
                  guidePreferences: {
                    timeSensitiveGuidance: !preferences.guidePreferences.timeSensitiveGuidance,
                  },
                })
              }
            >
              <Text style={styles.rowText}>Time-sensitive guidance</Text>
              <Text style={styles.check}>
                {preferences.guidePreferences.timeSensitiveGuidance ? '✓' : ''}
              </Text>
            </Pressable>
          </>
        ) : null}

        {section === 'discovery' ? (
          <>
            <Text style={styles.body}>
              Discovery preferences influence Explore and suggestions without resetting your journey.
            </Text>
            <DiscoveryToggle
              label="Include Public Skies in Explore"
              value={preferences.discoveryPreferences.includePublicSkiesInExplore}
              onToggle={() =>
                updatePreferences({
                  discoveryPreferences: {
                    includePublicSkiesInExplore:
                      !preferences.discoveryPreferences.includePublicSkiesInExplore,
                  },
                })
              }
            />
            <DiscoveryToggle
              label="Prioritize Connections"
              value={preferences.discoveryPreferences.prioritizeConnections}
              onToggle={() =>
                updatePreferences({
                  discoveryPreferences: {
                    prioritizeConnections: !preferences.discoveryPreferences.prioritizeConnections,
                  },
                })
              }
            />
            <DiscoveryToggle
              label="Prioritize shared communities"
              value={preferences.discoveryPreferences.prioritizeSharedCommunities}
              onToggle={() =>
                updatePreferences({
                  discoveryPreferences: {
                    prioritizeSharedCommunities:
                      !preferences.discoveryPreferences.prioritizeSharedCommunities,
                  },
                })
              }
            />
            <DiscoveryToggle
              label="Show opportunity discovery"
              value={preferences.discoveryPreferences.showOpportunityDiscovery}
              onToggle={() =>
                updatePreferences({
                  discoveryPreferences: {
                    showOpportunityDiscovery:
                      !preferences.discoveryPreferences.showOpportunityDiscovery,
                  },
                })
              }
            />
            <DiscoveryToggle
              label="Reduce discovery suggestions"
              value={preferences.discoveryPreferences.reduceDiscoverySuggestions}
              onToggle={() =>
                updatePreferences({
                  discoveryPreferences: {
                    reduceDiscoverySuggestions:
                      !preferences.discoveryPreferences.reduceDiscoverySuggestions,
                  },
                })
              }
            />
          </>
        ) : null}

        {section === 'personalization' ? (
          <>
            <PersonalizationToggle
              label="Use explicit interests"
              value={preferences.personalizationPreferences.useExplicitInterests}
              onToggle={() =>
                updatePreferences({
                  personalizationPreferences: {
                    useExplicitInterests: !preferences.personalizationPreferences.useExplicitInterests,
                  },
                })
              }
            />
            <PersonalizationToggle
              label="Use saved items"
              value={preferences.personalizationPreferences.useSavedItems}
              onToggle={() =>
                updatePreferences({
                  personalizationPreferences: {
                    useSavedItems: !preferences.personalizationPreferences.useSavedItems,
                  },
                })
              }
            />
            <PersonalizationToggle
              label="Use StarPath branches"
              value={preferences.personalizationPreferences.useStarPathBranches}
              onToggle={() =>
                updatePreferences({
                  personalizationPreferences: {
                    useStarPathBranches: !preferences.personalizationPreferences.useStarPathBranches,
                  },
                })
              }
            />
            <PersonalizationToggle
              label="Use Today's Focus"
              value={preferences.personalizationPreferences.useTodaysFocus}
              onToggle={() =>
                updatePreferences({
                  personalizationPreferences: {
                    useTodaysFocus: !preferences.personalizationPreferences.useTodaysFocus,
                  },
                })
              }
            />
            <PersonalizationToggle
              label="Use recent activity patterns"
              value={preferences.personalizationPreferences.useActivityPatterns}
              onToggle={() =>
                updatePreferences({
                  personalizationPreferences: {
                    useActivityPatterns: !preferences.personalizationPreferences.useActivityPatterns,
                  },
                })
              }
            />
          </>
        ) : null}

        {section === 'privacy' ? (
          <Text style={styles.body}>
            My Sky visibility: {onboarding.mySkyVisibilitySettings.skyVisibility}. Adjust visibility from My Sky
            privacy controls.
          </Text>
        ) : null}

        {section === 'help' ? (
          <Text style={styles.body}>
            REELYOU Beta — for support, visit help resources from your account team. Signal Center and Messages use
            local fixture data until backend connects.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function DiscoveryToggle({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onToggle} accessibilityLabel={label}>
      <Text style={styles.rowText}>{label}</Text>
      <Text style={styles.check}>{value ? '✓' : ''}</Text>
    </Pressable>
  );
}

function PersonalizationToggle({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onToggle} accessibilityLabel={label}>
      <Text style={styles.rowText}>{label}</Text>
      <Text style={styles.check}>{value ? '✓' : ''}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070A' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  back: { fontFamily: Fonts.sans, color: '#E8C872', fontWeight: '600' },
  title: { flex: 1, textAlign: 'center', fontFamily: Fonts.serif, color: '#F5F0FF', fontSize: 18 },
  spacer: { width: 48 },
  content: { padding: 16, gap: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(167,139,250,0.15)',
  },
  rowText: { fontFamily: Fonts.sans, color: '#F5F0FF', textTransform: 'capitalize' },
  check: { color: '#E8C872' },
  body: { fontFamily: Fonts.sans, color: 'rgba(235,228,248,0.75)', lineHeight: 20, fontSize: 14 },
});
