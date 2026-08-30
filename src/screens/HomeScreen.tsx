import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';

/** Temporary route shell — rejected Home UI removed */
export function HomeScreen() {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.shell}>
          <Text style={styles.label}>REELYOU Home Experience — rebuilding</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05040E',
  },
  safe: {
    flex: 1,
  },
  shell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(252, 251, 248, 0.92)',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
