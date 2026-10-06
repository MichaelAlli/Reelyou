import { runSignOutCleanups } from '@/auth/sessionLifecycle';
import { setActiveStorageUserId } from '@/storage/scopedAsyncStorage';

export async function performSignOut(input: {
  logout: () => Promise<void>;
  router: { replace: (href: never) => void };
}): Promise<void> {
  runSignOutCleanups();
  await input.logout();
  setActiveStorageUserId(null);
  input.router.replace('/welcome' as never);
}
