import { PublicSkyScreen } from '@/screens';
import { useLocalSearchParams } from 'expo-router';

export default function PublicSkyRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <PublicSkyScreen userId={id} />;
}
