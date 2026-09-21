import { useEffect } from 'react';

import { useSpatialFocusInteractionClear } from '@/spatialFocus/SpatialFocusContext';

/** Registers spatial focus clear with a parent handler (canvas lives outside provider). */
export function SpatialFocusTapSync({
  onRegisterClear,
}: {
  onRegisterClear: (clear: (() => void) | null) => void;
}) {
  const clear = useSpatialFocusInteractionClear();

  useEffect(() => {
    onRegisterClear(clear);
    return () => onRegisterClear(null);
  }, [clear, onRegisterClear]);

  return null;
}
