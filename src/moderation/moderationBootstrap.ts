import { isDevRuntime } from '@/constants/devFlags';
import { bootstrapModerationContentRegistry } from '@/moderation/moderationContentRegistry';
import { MODERATION_CONTENT_FIXTURES } from '@/moderation/moderationFixtures';

let bootstrapped = false;

export async function ensureModerationBootstrap(): Promise<void> {
  if (bootstrapped) return;
  bootstrapped = true;
  if (!isDevRuntime()) return;
  await bootstrapModerationContentRegistry(MODERATION_CONTENT_FIXTURES);
}
