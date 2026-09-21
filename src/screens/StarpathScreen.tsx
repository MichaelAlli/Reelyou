import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import { BottomNav } from '@/components/BottomNav';
import { StarPathScene } from '@/components/starpath/StarPathScene';
import { useOnboarding } from '@/onboarding';
import {
  StarPathExperienceProvider,
  useStarPathExperience,
} from '@/starpath/StarPathExperienceProvider';
import { getStarPathTheme } from '@/starpath/starpathTheme';

function StarPathOpportunityDeepLink({ nodeId }: { nodeId?: string }) {
  const experience = useStarPathExperience();
  useEffect(() => {
    if (nodeId?.trim()) {
      experience.navigateToOpportunityNode(nodeId.trim());
    }
  }, [experience, nodeId]);
  return null;
}

export function StarpathScreen() {
  const router = useRouter();
  const { opportunityNodeId } = useLocalSearchParams<{ opportunityNodeId?: string }>();
  const theme = getStarPathTheme('night');
  const { todayFocus } = useOnboarding();
  const focusNode =
    typeof opportunityNodeId === 'string' ? opportunityNodeId : opportunityNodeId?.[0];

  return (
    <View style={[styles.root, { backgroundColor: theme.canvasDeep }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <StarPathExperienceProvider todayFocusText={todayFocus.value}>
        <StarPathOpportunityDeepLink nodeId={focusNode} />
        <StarPathScene visualMode="night" onNextStepPress={() => router.push('/skywrite')} />
      </StarPathExperienceProvider>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
