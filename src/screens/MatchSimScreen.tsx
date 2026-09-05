import { useEffect, useRef, useState } from 'react';
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { GameState } from '../gameEngine';
import { MatchEvent, MatchEventKind } from '../matchSim';
import { colors, fonts } from '../theme';
import PitchBackground from '../components/PitchBackground';
import TeamAvatar from '../components/TeamAvatar';

const EVENT_DELAY_MS = 1000;
const MARKER_DELAY_MS = 1900;
const FULL_TIME_DELAY_MS = 1200;

const EVENT_ICON: Partial<Record<MatchEventKind, string>> = {
  goal: '⚽',
  yellowCard: '🟨',
  redCard: '🟥',
  penaltyScored: '⚽',
  penaltyMissed: '❌',
};

const MARKER_KINDS = new Set<MatchEventKind>(['fullTimeRegulation', 'fullTimeExtraTime', 'shootoutStart']);

/**
 * Plays out the simulated match one event at a time - goals, cards, and
 * penalty kicks land in a running list, while a commentary banner up top
 * always shows the latest happening, for the "Match Simulation" end mode's
 * own bit of drama before landing on Final Results.
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
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!result) return;
    if (visibleCount >= result.events.length) {
      const timer = setTimeout(() => setFullTime(true), FULL_TIME_DELAY_MS);
      return () => clearTimeout(timer);
    }
    const nextKind = result.events[visibleCount].kind;
    const delay = MARKER_KINDS.has(nextKind) ? MARKER_DELAY_MS : EVENT_DELAY_MS;
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCount, result]);

  if (!result) return null;

  const visibleEvents = result.events.slice(0, visibleCount);
  const mainScore = {
    1: visibleEvents.filter((e) => e.kind === 'goal' && e.team === 1).length,
    2: visibleEvents.filter((e) => e.kind === 'goal' && e.team === 2).length,
  };
  const penScore = {
    1: visibleEvents.filter((e) => e.kind === 'penaltyScored' && e.team === 1).length,
    2: visibleEvents.filter((e) => e.kind === 'penaltyScored' && e.team === 2).length,
  };
  const inShootout = visibleEvents.some((e) => e.kind === 'shootoutStart');
  const latest = visibleEvents[visibleEvents.length - 1] ?? null;

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
          <View style={styles.scoreCenter}>
            <Text style={styles.score}>
              {mainScore[1]} - {mainScore[2]}
            </Text>
            {inShootout && (
              <Text style={styles.penScore}>
                ({penScore[1]} - {penScore[2]} pens)
              </Text>
            )}
          </View>
          <View style={styles.teamCol}>
            <TeamAvatar avatarId={state.teams[2].avatar} size={30} />
            <Text style={[styles.teamName, { color: colors.team2 }]} numberOfLines={1}>
              {state.teams[2].name}
            </Text>
          </View>
        </View>

        <View style={styles.commentaryBox}>
          <Text style={styles.commentaryText}>
            {latest ? latest.commentary : 'Kick-off…'}
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.events}
          contentContainerStyle={styles.eventsContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {visibleEvents.map((e, i) =>
            MARKER_KINDS.has(e.kind) ? (
              <View key={i} style={styles.marker}>
                <View style={styles.markerLine} />
                <Text style={styles.markerText}>{e.minuteLabel}</Text>
                <View style={styles.markerLine} />
              </View>
            ) : (
              <EventRow key={i} event={e} />
            )
          )}
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

function EventRow({ event }: { event: MatchEvent }) {
  const color = event.team === 1 ? colors.team1 : event.team === 2 ? colors.team2 : colors.textMuted;
  return (
    <Text style={[styles.eventText, { color }]}>
      {event.minuteLabel} {EVENT_ICON[event.kind] ?? ''} {event.player}
    </Text>
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
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 14,
  },
  teamCol: { alignItems: 'center', gap: 6, width: 100 },
  teamName: { fontSize: 13, fontWeight: '700' },
  scoreCenter: { alignItems: 'center' },
  score: { color: colors.textInverse, fontSize: 44, fontFamily: fonts.display },
  penScore: { color: colors.accent, fontSize: 13, fontWeight: '700', marginTop: 2 },
  commentaryBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    minHeight: 56,
    justifyContent: 'center',
  },
  commentaryText: {
    color: colors.text,
    fontSize: 14.5,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  events: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 16 },
  eventsContent: { gap: 10 },
  eventText: { fontSize: 14, fontWeight: '600' },
  marker: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  markerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  markerText: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { fontSize: 18, fontFamily: fonts.display, letterSpacing: 1, color: colors.bg },
});
