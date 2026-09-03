import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const STRIPE_COUNT = 14;

/** Subtle dark mowed-pitch stripe texture, dropped in behind a screen's content. */
export default function PitchBackground() {
  return (
    <View style={styles.stripes} pointerEvents="none">
      {Array.from({ length: STRIPE_COUNT }).map((_, i) => (
        <View key={i} style={[styles.stripe, i % 2 === 0 ? styles.stripeA : styles.stripeB]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stripes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
  },
  stripe: { flex: 1 },
  stripeA: { backgroundColor: colors.bg },
  stripeB: { backgroundColor: '#0a2318' },
});
