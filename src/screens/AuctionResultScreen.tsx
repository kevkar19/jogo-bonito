import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GameState } from '../gameEngine';
import { POSITION_LABELS } from '../types';
import { colors } from '../theme';
import PlayerAvatar from '../components/PlayerAvatar';
import FlipCard from '../components/FlipCard';
import CardBack from '../components/CardBack';
import TierBadge from '../components/TierBadge';

const CARD_HEIGHT = 220;

function RatingLine({ overall, hideRatings }: { overall: number; hideRatings: boolean }) {
  return (
    <View style={styles.ratingLine}>
      {!hideRatings && <Text style={styles.overallValue}>{overall} OVR</Text>}
      <TierBadge overall={overall} size={hideRatings ? 'lg' : 'sm'} />
    </View>
  );
}

export default function AuctionResultScreen({
  state,
  onContinue,
}: {
  state: GameState;
  onContinue: () => void;
}) {
  const result = state.lastResult;
  const hideRatings = state.config.hideRatings;
  // Only an uncontested win is a genuinely new reveal (it never went through
  // BiddingScreen's flip) - track that case's flip completion here.
  const isFreshReveal = result?.type === 'won' && !result.contested;
  const [revealed, setRevealed] = useState(!isFreshReveal);

  useEffect(() => {
    setRevealed(!isFreshReveal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.type === 'won' ? result.player.id : result?.type]);

  if (!result) return null;

  if (result.type === 'skipped') {
    return (
      <View style={styles.container}>
        <Text style={styles.skippedHeadline}>Nobody wanted them!</Text>
        <View style={styles.playerCard}>
          <PlayerAvatar player={result.player} size={64} />
          <Text style={styles.playerName}>{result.player.name}</Text>
          <Text style={styles.playerPosition}>{POSITION_LABELS[result.player.position]}</Text>
          {/* Already had its reveal in BiddingScreen, so the rating always shows here. */}
          <RatingLine overall={result.player.overall} hideRatings={false} />
        </View>
        <Text style={styles.note}>
          Both players passed, so {result.player.name} is out of the auction. A fresh{' '}
          {POSITION_LABELS[result.player.position]} takes their place in the pool.
        </Text>

        <Text style={styles.replacementLabel}>Replacement</Text>
        <View style={styles.playerCard}>
          {result.replacement.isIcon && (
            <View style={styles.iconBadge}>
              <Text style={styles.iconBadgeText}>⭐ ICON</Text>
            </View>
          )}
          <PlayerAvatar player={result.replacement} size={64} />
          <Text style={styles.playerName}>{result.replacement.name}</Text>
          <Text style={styles.playerPosition}>{POSITION_LABELS[result.replacement.position]}</Text>
          {/* Hasn't had its own reveal yet - respects the setting like the squad view does. */}
          <RatingLine overall={result.replacement.overall} hideRatings={hideRatings} />
        </View>

        <Pressable style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    );
  }

  const winnerTeam = state.teams[result.winner];
  const accent = result.winner === 1 ? colors.team1 : colors.team2;

  const cardContent = (
    <View style={styles.playerCard}>
      {result.player.isIcon && (
        <View style={styles.iconBadge}>
          <Text style={styles.iconBadgeText}>⭐ ICON</Text>
        </View>
      )}
      <PlayerAvatar player={result.player} size={64} />
      <Text style={styles.playerName}>{result.player.name}</Text>
      <Text style={styles.playerPosition}>{POSITION_LABELS[result.player.position]}</Text>
      {/* Already had its reveal in BiddingScreen (or is revealing right now via the flip
          card below for an uncontested win), so the rating always shows here. */}
      <RatingLine overall={result.player.overall} hideRatings={false} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.winnerName, { color: accent }]}>{winnerTeam.name} wins!</Text>

      {isFreshReveal ? (
        <FlipCard
          flipKey={result.player.id}
          height={CARD_HEIGHT}
          back={<CardBack />}
          front={cardContent}
          onFlipped={() => setRevealed(true)}
        />
      ) : (
        cardContent
      )}

      {revealed && (
        <>
          <Text style={styles.amount}>for {result.amount} coins</Text>
          {!result.contested && (
            <Text style={styles.note}>
              No competing bid — the other squad's {POSITION_LABELS[result.player.position]} slot
              was already filled.
            </Text>
          )}
        </>
      )}

      <Pressable style={styles.button} onPress={onContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  winnerName: { fontSize: 26, fontWeight: '800', marginBottom: 20 },
  skippedHeadline: { fontSize: 24, fontWeight: '800', color: colors.textInverse, marginBottom: 16 },
  replacementLabel: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  playerCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    width: '100%',
  },
  iconBadge: {
    backgroundColor: '#d4af37',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 10,
  },
  iconBadgeText: { color: '#3a2f0b', fontWeight: '800', fontSize: 11 },
  playerName: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 10 },
  playerPosition: { fontSize: 13, color: colors.textMuted, marginBottom: 8 },
  ratingLine: { alignItems: 'center', gap: 6 },
  overallValue: { fontSize: 22, fontWeight: '900', color: colors.pitch },
  amount: { color: colors.accent, fontSize: 18, fontWeight: '700', marginBottom: 16, marginTop: 12 },
  note: {
    color: '#c9dcd2',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: { fontSize: 16, fontWeight: '800', color: colors.bg },
});
