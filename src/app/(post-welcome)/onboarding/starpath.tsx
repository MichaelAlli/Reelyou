import { Redirect } from 'expo-router';

/** Legacy route — redirects to the Process Screen. */
export default function OnboardingStarpathRedirect() {
  return <Redirect href={'/process' as never} />;
}
