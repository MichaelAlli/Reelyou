import { ProcessStarPathExperience } from '@/components/process-starpath';
import { useProcessSession } from '@/process';

export function ProcessScreen() {
  const session = useProcessSession();

  return (
    <ProcessStarPathExperience
      progress={session.progress}
      statusLabel={session.statusLabel}
      reduceMotion={session.reduceMotion}
      isComplete={session.isComplete}
      exitOpacity={session.exitOpacity}
      onNavigateHome={session.onNavigateHome}
      onStartProcessing={session.startProcessing}
    />
  );
}
