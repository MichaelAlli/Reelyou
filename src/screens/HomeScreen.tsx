import { useLocalSearchParams } from 'expo-router';

import { HomeExperience } from '@/components/home';

/** REELYOU Home / Arrival shell — HOME 02 */
export function HomeScreen() {
  const params = useLocalSearchParams<{ preview?: string }>();
  const calmEntry = params.preview === '1';

  return <HomeExperience calmEntry={calmEntry} />;
}
