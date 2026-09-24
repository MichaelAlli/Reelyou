import { useLocalSearchParams } from 'expo-router';

import { VisitorRippleScreen } from '@/screens/VisitorRippleScreen';

export default function VisitorRippleRoute() {
  const { ownerId } = useLocalSearchParams<{ ownerId?: string }>();
  return <VisitorRippleScreen ownerId={ownerId} />;
}
