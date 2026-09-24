import { useLocalSearchParams } from 'expo-router';

import { VisitorRippleMapScreen } from '@/screens/VisitorRippleMapScreen';

export default function VisitorRippleMapRoute() {
  const { ownerId } = useLocalSearchParams<{ ownerId?: string }>();
  return <VisitorRippleMapScreen ownerId={ownerId} />;
}
