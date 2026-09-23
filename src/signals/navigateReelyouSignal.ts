import type { ReelyouSignal } from '@/signals/reelyouSignalTypes';

type SignalNavigationRouter = {
  push: (href: never) => void;
};

export function navigateReelyouSignal(
  router: SignalNavigationRouter,
  signal: Pick<ReelyouSignal, 'destinationRoute' | 'destinationParams' | 'type'>,
): void {
  if (signal.destinationParams?.threadId) {
    router.push(`/messages/${signal.destinationParams.threadId}` as never);
    return;
  }
  if (signal.destinationParams?.opportunityNodeId) {
    router.push(
      `/starpath?opportunityNodeId=${signal.destinationParams.opportunityNodeId}` as never,
    );
    return;
  }
  if (signal.destinationParams?.id && signal.destinationRoute === '/community') {
    router.push(`/community?id=${signal.destinationParams.id}` as never);
    return;
  }
  const skywriteId =
    signal.destinationParams?.skywriteId ??
    ('sourceId' in signal && signal.type === 'sky_activity' ? signal.sourceId : undefined);
  if (skywriteId) {
    const source = signal.destinationParams?.source;
    router.push(
      (source ? `/skywrite/${skywriteId}?source=${source}` : `/skywrite/${skywriteId}`) as never,
    );
    return;
  }
  if (signal.destinationRoute.startsWith('/')) {
    router.push(signal.destinationRoute as never);
  }
}
