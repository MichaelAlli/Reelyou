import { useLocalSearchParams } from 'expo-router';

import { CommunityDetailScreen } from '@/screens/CommunityDetailScreen';

export default function CommunityRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <CommunityDetailScreen communityId={id} />;
}
