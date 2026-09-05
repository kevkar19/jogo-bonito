import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { BiddingMode, Team, TeamId, squadPlayers } from '../types';
import { colors, fonts } from '../theme';
import TeamAvatar from './TeamAvatar';

/**
 * Always-visible scoreboard for both squads - shows each side's coin budget
 * (or, in draft mode, picks made) at all times, with the active side called
 * out via a glowing border and a slow breathing pulse, so who's up is
 * unmistakable even at a glance from across the table.
 */
export default function TeamStatusBar({
  teams,
  turn,
  biddingMode,
}: {
  teams: Record<TeamId, Team>;
  turn: TeamId;
  biddingMode: BiddingMode;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pulse.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [turn, pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });

  return (
    <View style={styles.row}>
      <TeamCard
        team={teams[1]}
        accent={colors.team1}
        isActive={turn === 1}
        scale={scale}
        biddingMode={biddingMode}
      />
      <TeamCard
        team={teams[2]}
        accent={colors.team2}
        isActive={turn === 2}
        scale={scale}
        biddingMode={biddingMode}
      />
    </View>
  );
}

function TeamCard({
  team,
  accent,
  isActive,
  scale,
  biddingMode,
}: {
  team: Team;
  accent: string;
  isActive: boolean;
  scale: Animated.AnimatedInterpolation<number>;
  biddingMode: BiddingMode;
}) {
  const isDraft = biddingMode === 'draft';
  const statValue = isDraft ? squadPlayers(team.squad).length : team.budget;
  const statLabel = isDraft ? 'players picked' : 'coins available';

  return (
    <Animated.View
      style={[
        styles.card,
        {
          borderColor: isActive ? accent : colors.border,
          backgroundColor: isActive ? `${accent}1c` : colors.surface,
          shadowColor: accent,
          shadowOpacity: isActive ? 0.55 : 0,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 0 },
          elevation: isActive ? 10 : 0,
          transform: [{ scale: isActive ? scale : 1 }],
        },
      ]}
    >
      {isActive && (
        <View style={[styles.turnChip, { backgroundColor: accent }]}>
          <View style={styles.turnDot} />
          <Text style={styles.turnChipText}>TURN</Text>
        </View>
      )}
      <View style={styles.identityRow}>
        <TeamAvatar avatarId={team.avatar} size={26} />
        <Text
          style={[styles.name, { color: isActive ? accent : colors.text }]}
          numberOfLines={1}
        >
          {team.name}
        </Text>
      </View>
      <Text style={[styles.budget, { color: isActive ? accent : colors.text }]}>
        {statValue}
      </Text>
      <Text style={styles.coinsLabel}>{statLabel}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  turnChip: {
    position: 'absolute',
    top: -9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  turnDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.bg,
  },
  turnChipText: {
    color: colors.bg,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    maxWidth: '100%',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  budget: {
    fontSize: 26,
    fontFamily: fonts.display,
    marginTop: 2,
    lineHeight: 30,
  },
  coinsLabel: {
    color: colors.textMuted,
    fontSize: 10,
  },
});
