import { Redirect } from 'expo-router';

/** Global menu alias — owner Profile / Me lives on the tab route. */
export default function ProfileAliasRoute() {
  return <Redirect href={'/(tabs)/profile' as never} />;
}
