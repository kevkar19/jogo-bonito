import Ionicons from '@expo/vector-icons/build/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Player, POSITION_LABELS, getRatingTier } from '../types';
import { POSITION_AVATAR } from '../avatars';
import { ICON_PHOTOS } from '../iconPhotos';
import { colors, TIER_COLORS } from '../theme';
import TierBadge from './TierBadge';

/**
 * The big, full-photo "reveal" card used the moment a player comes up for
 * auction - photo fills the whole card, info is overlaid on a bottom scrim,
 * and the border color signals rarity tier at a glance.
 */
export default function PlayerRevealCard({ player }: { player: Player }) {
  const photo = player.isIcon ? ICON_PHOTOS[player.name] : undefined;
  const posSpec = POSITION_AVATAR[player.position];
  const tier = getRatingTier(player.overall);
  const tierColor = TIER_COLORS[tier];

  return (
    <View style={[styles.card, { borderColor: tierColor }]}>
      {photo ? (
        <Image source={photo} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={[styles.photo, styles.fallback, { backgroundColor: posSpec.color }]}>
          <Ionicons name={posSpec.icon} size={110} color="rgba(255,255,255,0.35)" />
        </View>
      )}

      <View style={styles.topRow}>
        <View style={[styles.positionBadge, { backgroundColor: colors.pitch }]}>
          <Text style={styles.positionBadgeText}>{player.position}</Text>
        </View>
        {player.isIcon && (
          <View style={styles.iconBadge}>
            <Text style={styles.iconBadgeText}>⭐ ICON</Text>
          </View>
        )}
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)']}
        locations={[0, 0.45, 1]}
        style={styles.scrim}
      >
        <Text style={styles.name} numberOfLines={1}>
          {player.name}
        </Text>
        <Text style={styles.positionLabel}>{POSITION_LABELS[player.position]}</Text>
        <View style={styles.statRow}>
          <View style={styles.ovrWrap}>
            <Text style={styles.ovrValue}>{player.overall}</Text>
            <Text style={styles.ovrLabel}>OVR</Text>
          </View>
          <TierBadge overall={player.overall} size="lg" />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: colors.pitch,
  },
  photo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  positionBadge: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  positionBadgeText: { color: colors.textInverse, fontWeight: '800', fontSize: 13 },
  iconBadge: {
    backgroundColor: '#d4af37',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  iconBadgeText: { color: '#3a2f0b', fontWeight: '800', fontSize: 12 },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 18,
  },
  name: {
    color: colors.textInverse,
    fontSize: 26,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  positionLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 10,
  },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ovrWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  ovrValue: { color: colors.accent, fontSize: 32, fontWeight: '900' },
  ovrLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700' },
});
