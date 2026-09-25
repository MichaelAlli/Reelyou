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
  if (signal.destinationRoute.startsWith('/emerging-constellation')) {
    const params = signal.destinationParams ?? {};
    const query = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    router.push(`${signal.destinationRoute}${query ? `?${query}` : ''}` as never);
    return;
  }
  if (signal.destinationRoute.startsWith('/')) {
    const params = signal.destinationParams ?? {};
    const query = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    router.push(
      `${signal.destinationRoute}${query ? (signal.destinationRoute.includes('?') ? '&' : '?') + query : ''}` as never,
    );
  }
}
