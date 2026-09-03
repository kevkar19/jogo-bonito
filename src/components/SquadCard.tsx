import Ionicons from '@expo/vector-icons/build/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { Player, Team, squadTotalOverall } from '../types';
import { colors } from '../theme';
import TeamAvatar from './TeamAvatar';
import TierBadge from './TierBadge';

function Row({
  label,
  player,
  hideRatings,
}: {
  label: string;
  player: Player | null;
  hideRatings: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.posLabel}>{label}</Text>
      {player ? (
        <>
          <Text style={styles.playerName} numberOfLines={1}>
            {player.name}
          </Text>
          {player.isIcon && <Ionicons name="trophy" size={12} color="#d4af37" />}
          <TierBadge overall={player.overall} size="sm" />
          {!hideRatings && <Text style={styles.overall}>{player.overall}</Text>}
        </>
      ) : (
        <Text style={styles.empty}>—</Text>
      )}
    </View>
  );
}

export default function SquadCard({
  team,
  accent,
  isWinner,
  hideRatings = false,
}: {
  team: Team;
  accent: string;
  isWinner: boolean;
  /** Hides individual and total ratings, e.g. mid-game with "Hide overall ratings" on. */
  hideRatings?: boolean;
}) {
  const total = squadTotalOverall(team.squad);
  return (
    <View style={[styles.card, isWinner && { borderColor: accent, borderWidth: 2 }]}>
      <View style={styles.header}>
        <TeamAvatar avatarId={team.avatar} size={22} />
        <Text style={[styles.name, { color: accent }]} numberOfLines={1}>
          {team.name}
          {isWinner ? ' 🏆' : ''}
        </Text>
      </View>
      <Row label="GK" player={team.squad.GK} hideRatings={hideRatings} />
      <Row label="DEF" player={team.squad.DEF} hideRatings={hideRatings} />
      <Row label="CM" player={team.squad.CM[0]} hideRatings={hideRatings} />
      <Row label="CM" player={team.squad.CM[1]} hideRatings={hideRatings} />
      <Row label="ST" player={team.squad.ST} hideRatings={hideRatings} />
      <View style={styles.divider} />
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Total OVR</Text>
        <Text style={[styles.statValue, hideRatings && styles.statValueHidden]}>
          {hideRatings ? 'Hidden' : total}
        </Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Budget left</Text>
        <Text style={styles.statValue}>{team.budget}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  name: { fontWeight: '700', fontSize: 15, flexShrink: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
    gap: 6,
  },
  posLabel: {
    width: 30,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  playerName: { flex: 1, fontSize: 12, color: colors.text },
  overall: { fontSize: 12, fontWeight: '700', color: colors.text },
  empty: { flex: 1, fontSize: 12, color: colors.disabled },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  statLabel: { fontSize: 12, color: colors.textMuted },
  statValue: { fontSize: 13, fontWeight: '700', color: colors.text },
  statValueHidden: { color: colors.textMuted, fontStyle: 'italic', fontWeight: '600' },
});
