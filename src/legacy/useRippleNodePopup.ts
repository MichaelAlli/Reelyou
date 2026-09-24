import { useMemo, useState } from 'react';

import { buildRippleConnectionDetail } from '@/legacy/buildRippleConnectionDetail';
import type { HumanPotentialMetricsState } from '@/humanPotential/humanPotentialMetricsState';

export function useRippleNodePopup(input: {
  ownerUserId: string;
  metrics: HumanPotentialMetricsState;
  userDirectory: Readonly<Record<string, string>>;
}) {
  const [personUserId, setPersonUserId] = useState<string | null>(null);

  const detail = useMemo(() => {
    if (!personUserId) return null;
    return buildRippleConnectionDetail({
      ownerUserId: input.ownerUserId,
      personUserId,
      metrics: input.metrics,
      userDirectory: input.userDirectory,
    });
  }, [input.metrics, input.ownerUserId, input.userDirectory, personUserId]);

  return {
    personUserId,
    detail,
    openNode: setPersonUserId,
    closeNode: () => setPersonUserId(null),
    visible: personUserId != null,
  };
}
