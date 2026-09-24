import { useLocalSearchParams } from 'expo-router';

import { VisitorReelYouScreen } from '@/screens/VisitorReelYouScreen';

export default function VisitorReelYouRoute() {
  const { ownerId } = useLocalSearchParams<{ ownerId?: string }>();
  return <VisitorReelYouScreen ownerId={ownerId} />;
}
