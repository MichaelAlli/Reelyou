import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { performSignOut } from '@/auth/performSignOut';
import { useReelyouAuth } from '@/auth/ReelyouAuthProvider';

export function usePerformSignOut() {
  const auth = useReelyouAuth();
  const router = useRouter();

  return useCallback(async () => {
    await performSignOut({ logout: auth.logout, router });
  }, [auth.logout, router]);
}
