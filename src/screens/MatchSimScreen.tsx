import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameState } from '../gameEngine';
import { colors, fonts } from '../theme';
import PitchBackground from '../components/PitchBackground';
import TeamAvatar from '../components/TeamAvatar';

const EVENT_DELAY_MS = 900;
const FULL_TIME_DELAY_MS = 1000;

/**
 * Plays out the simulated match one goal at a time (rather than dumping the
 * final score immediately) so the "Match Simulation" end mode gets its own
 * bit of drama before landing on Final Results.
 */
export default function MatchSimScreen({
  state,
  onFinish,
}: {
  state: GameState;
  onFinish: () => void;
}) {
  const result = state.matchResult;
  const [visibleCount, setVisibleCount] = useState(0);
  const [fullTime, setFullTime] = useState(false);

  useEffect(() => {
    if (!result) return;
    if (visibleCount >= result.events.length) {
      const timer = setTimeout(() => setFullTime(true), FULL_TIME_DELAY_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), EVENT_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCount, result]);

  if (!result) return null;

  const visibleEvents = result.events.slice(0, visibleCount);
  const score1 = visibleEvents.filter((e) => e.team === 1).length;
  const score2 = visibleEvents.filter((e) => e.team === 2).length;

  return (
    <View style={styles.flex}>
      <PitchBackground />
      <View style={styles.container}>
        <Text style={styles.eyebrow}>{fullTime ? 'Full Time' : 'Match in progress…'}</Text>

        <View style={styles.scoreRow}>
          <View style={styles.teamCol}>
            <TeamAvatar avatarId={state.teams[1].avatar} size={30} />
            <Text style={[styles.teamName, { color: colors.team1 }]} numberOfLines={1}>
              {state.teams[1].name}
            </Text>
          </View>
          <Text style={styles.score}>
            {score1} - {score2}
          </Text>
          <View style={styles.teamCol}>
            <TeamAvatar avatarId={state.teams[2].avatar} size={30} />
            <Text style={[styles.teamName, { color: colors.team2 }]} numberOfLines={1}>
              {state.teams[2].name}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.events} contentContainerStyle={styles.eventsContent}>
          {visibleEvents.length === 0 && !fullTime && <Text style={styles.waitingText}>Kick-off…</Text>}
          {visibleEvents.map((e, i) => (
            <Text
              key={i}
              style={[styles.eventText, { color: e.team === 1 ? colors.team1 : colors.team2 }]}
            >
              ⚽ {e.minute}&apos; - {e.scorer} ({state.teams[e.team].name})
            </Text>
          ))}
        </ScrollView>

        {fullTime && (
          <Pressable style={styles.button} onPress={onFinish}>
            <Text style={styles.buttonText}>See Results</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  eyebrow: {
    color: colors.accent,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  teamCol: { alignItems: 'center', gap: 6, width: 100 },
  teamName: { fontSize: 13, fontWeight: '700' },
  score: { color: colors.textInverse, fontSize: 44, fontFamily: fonts.display },
  events: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 16 },
  eventsContent: { gap: 10 },
  waitingText: { color: colors.textMuted, textAlign: 'center', fontStyle: 'italic', marginTop: 10 },
  eventText: { fontSize: 14, fontWeight: '600' },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { fontSize: 18, fontFamily: fonts.display, letterSpacing: 1, color: colors.bg },
});
