import { StyleSheet, Text, View } from 'react-native';
import { getRatingTier } from '../types';
import { TIER_COLORS } from '../theme';

export default function TierBadge({
  overall,
  size = 'md',
}: {
  overall: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const tier = getRatingTier(overall);
  const color = TIER_COLORS[tier];
  const label = size === 'sm' ? tier.slice(0, 3).toUpperCase() : tier.toUpperCase();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        size === 'lg' && styles.badgeLg,
        { borderColor: color, backgroundColor: `${color}22` },
      ]}
    >
      <Text style={[styles.text, size === 'sm' && styles.textSm, size === 'lg' && styles.textLg, { color }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'center',
  },
  badgeSm: { paddingHorizontal: 7, paddingVertical: 2 },
  badgeLg: { paddingHorizontal: 14, paddingVertical: 6 },
  text: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  textSm: { fontSize: 9 },
  textLg: { fontSize: 14 },
});
