import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GameState } from '../gameEngine';
import { POSITION_LABELS } from '../types';
import { colors } from '../theme';
import PlayerAvatar from '../components/PlayerAvatar';
import TeamAvatar from '../components/TeamAvatar';
import FlipCard from '../components/FlipCard';
import CardBack from '../components/CardBack';
import TierBadge from '../components/TierBadge';

const CARD_HEIGHT = 230;

export default function BiddingScreen({
  state,
  onRaise,
  onCustomBid,
  onPass,
}: {
  state: GameState;
  onRaise: () => void;
  onCustomBid: (amount: number) => void;
  onPass: () => void;
}) {
  const { currentPlayer, currentBid, currentBidder, turn, teams, config, openingPassed } = state;
  const [customBidText, setCustomBidText] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [raiseConfirmPending, setRaiseConfirmPending] = useState(false);
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setRevealed(false);
  }, [currentPlayer?.id]);

  const clearPendingConfirm = () => {
    if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    confirmTimeoutRef.current = null;
    setRaiseConfirmPending(false);
  };

  // Cancel any pending confirmation when the turn moves on, so a stale
  // "tap again to confirm" state never carries over to the next decision.
  useEffect(() => {
    clearPendingConfirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, currentBid]);

  useEffect(() => {
    if (!raiseConfirmPending) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [raiseConfirmPending, pulse]);

  useEffect(() => () => {
    if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
  }, []);

  const armConfirm = () => {
    setRaiseConfirmPending(true);
    if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    confirmTimeoutRef.current = setTimeout(() => setRaiseConfirmPending(false), 3000);
  };

  if (!currentPlayer || turn === null) return null;

  const turnTeam = teams[turn];
  const turnAccent = turn === 1 ? colors.team1 : colors.team2;
  const bidderTeam = currentBidder !== null ? teams[currentBidder] : null;
  const bidderAccent = currentBidder === 1 ? colors.team1 : colors.team2;

  const nextBid = currentBid + config.bidIncrement;
  const canRaise = nextBid <= turnTeam.budget;

  const minCustomBid = currentBidder === null ? config.bidIncrement : currentBid + 1;
  const parsedCustomBid = parseInt(customBidText, 10);
  const customBidValid =
    customBidText.trim() !== '' &&
    Number.isFinite(parsedCustomBid) &&
    parsedCustomBid >= minCustomBid &&
    parsedCustomBid <= turnTeam.budget;

  let customBidError: string | null = null;
  if (customBidText.trim() !== '' && !customBidValid) {
    if (!Number.isFinite(parsedCustomBid)) {
      customBidError = 'Enter a whole number.';
    } else if (parsedCustomBid < minCustomBid) {
      customBidError = `Must be at least ${minCustomBid}.`;
    } else if (parsedCustomBid > turnTeam.budget) {
      customBidError = `Only ${turnTeam.budget} coins available.`;
    }
  }

  const handleRaisePress = () => {
    if (!raiseConfirmPending) {
      armConfirm();
      return;
    }
    clearPendingConfirm();
    onRaise();
  };

  const handleCustomBidPress = () => {
    if (!customBidValid) return;
    onCustomBid(parsedCustomBid);
    setCustomBidText('');
  };

  let passLabel: string;
  if (bidderTeam) {
    passLabel = `Pass — ${bidderTeam.name} wins for ${currentBid}`;
  } else if (openingPassed) {
    passLabel = `Pass — ${currentPlayer.name} will be skipped & replaced`;
  } else {
    passLabel = 'Pass on this player';
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>Player up for auction</Text>

        <FlipCard
          flipKey={currentPlayer.id}
          height={CARD_HEIGHT}
          onFlipped={() => setRevealed(true)}
          back={<CardBack />}
          front={
            <View style={styles.playerCard}>
              {currentPlayer.isIcon && (
                <View style={styles.iconBadge}>
                  <Text style={styles.iconBadgeText}>⭐ ICON</Text>
                </View>
              )}
              <PlayerAvatar player={currentPlayer} size={52} />
              <View style={styles.positionBadge}>
                <Text style={styles.positionBadgeText}>{currentPlayer.position}</Text>
              </View>
              <Text style={styles.playerName}>{currentPlayer.name}</Text>
              <Text style={styles.playerPosition}>{POSITION_LABELS[currentPlayer.position]}</Text>
              {/* The reveal always shows the exact rating, even with "Hide overall ratings"
                  on - it only hides once the player lands in a squad. */}
              <View style={styles.overallBadge}>
                <Text style={styles.overallValue}>{currentPlayer.overall}</Text>
                <Text style={styles.overallLabel}>OVR</Text>
              </View>
              <View style={styles.tierRow}>
                <TierBadge overall={currentPlayer.overall} size="sm" />
              </View>
            </View>
          }
        />

        {!revealed ? (
          <Text style={styles.revealingText}>Revealing player…</Text>
        ) : (
          <>
            <View style={styles.bidInfo}>
              <Text style={styles.bidLabel}>Current bid</Text>
              <Text style={styles.bidValue}>{currentBid} coins</Text>
              {bidderTeam && (
                <Text style={[styles.bidderText, { color: bidderAccent }]}>
                  held by {bidderTeam.name}
                </Text>
              )}
            </View>

            <View style={styles.turnStatusWrap}>
              <View
                style={[
                  styles.turnPill,
                  { backgroundColor: `${turnAccent}20`, borderColor: `${turnAccent}70` },
                ]}
              >
                <View style={[styles.turnDot, { backgroundColor: turnAccent }]} />
                <TeamAvatar avatarId={turnTeam.avatar} size={16} />
                <Text style={[styles.turnPillText, { color: turnAccent }]}>
                  <Text style={{ fontWeight: '800' }}>{turnTeam.name}</Text>
                  <Text style={{ fontWeight: '600' }}>'s turn</Text>
                </Text>
              </View>
              <Text style={styles.turnBudgetText}>{turnTeam.budget} coins available</Text>
            </View>

            <Animated.View
              style={{ transform: [{ scale: raiseConfirmPending ? pulse : 1 }] }}
            >
              <Pressable
                style={[
                  styles.actionButton,
                  raiseConfirmPending ? styles.confirmButton : styles.raiseButton,
                  !canRaise && styles.disabledButton,
                ]}
                onPress={handleRaisePress}
                disabled={!canRaise}
              >
                <Text style={styles.actionButtonText}>
                  {!canRaise
                    ? 'Not enough coins to raise'
                    : raiseConfirmPending
                      ? `Tap again to confirm raise to ${nextBid}`
                      : `Raise to ${nextBid}`}
                </Text>
              </Pressable>
            </Animated.View>

            <View style={styles.customBidRow}>
              <TextInput
                style={[styles.customBidInput, customBidError && styles.customBidInputError]}
                value={customBidText}
                onChangeText={setCustomBidText}
                placeholder={`Custom bid (min ${minCustomBid})`}
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
              />
              <Pressable
                style={[styles.customBidButton, !customBidValid && styles.disabledButton]}
                onPress={handleCustomBidPress}
                disabled={!customBidValid}
              >
                <Text style={styles.customBidButtonText}>Bid</Text>
              </Pressable>
            </View>
            {customBidError && <Text style={styles.customBidErrorText}>{customBidError}</Text>}

            <Pressable style={[styles.actionButton, styles.passButton]} onPress={onPass}>
              <Text style={styles.passButtonText}>{passLabel}</Text>
            </Pressable>

            <View style={styles.budgetsRow}>
              <Text style={[styles.budgetChip, { color: colors.team1 }]}>
                {teams[1].name}: {teams[1].budget}
              </Text>
              <Text style={[styles.budgetChip, { color: colors.team2 }]}>
                {teams[2].name}: {teams[2].budget}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    padding: 20,
    paddingTop: 24,
    paddingBottom: 14,
  },
  eyebrow: {
    color: colors.accent,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 8,
  },
  playerCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  iconBadge: {
    backgroundColor: '#d4af37',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 3,
    marginBottom: 6,
  },
  iconBadgeText: { color: '#3a2f0b', fontWeight: '800', fontSize: 10 },
  tierRow: { marginTop: 6 },
  positionBadge: {
    backgroundColor: colors.pitch,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 4,
    marginTop: 7,
    marginBottom: 6,
  },
  positionBadgeText: { color: colors.textInverse, fontWeight: '700', fontSize: 12 },
  playerName: { fontSize: 19, fontWeight: '800', color: colors.text },
  playerPosition: { fontSize: 12, color: colors.textMuted, marginBottom: 5 },
  overallBadge: { alignItems: 'center' },
  overallValue: { fontSize: 28, fontWeight: '900', color: colors.pitch },
  overallLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted },
  revealingText: {
    color: '#c9dcd2',
    textAlign: 'center',
    marginTop: 14,
    fontSize: 14,
    fontStyle: 'italic',
  },
  bidInfo: { alignItems: 'center', marginTop: 12, marginBottom: 9 },
  bidLabel: { color: '#c9dcd2', fontSize: 12 },
  bidValue: { color: colors.textInverse, fontSize: 25, fontWeight: '800' },
  bidderText: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  turnStatusWrap: { alignItems: 'center', marginBottom: 12 },
  turnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  turnDot: { width: 6, height: 6, borderRadius: 3 },
  turnPillText: { fontSize: 13 },
  turnBudgetText: { color: '#c9dcd2', fontSize: 12, marginTop: 4 },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },
  raiseButton: { backgroundColor: colors.accent },
  confirmButton: { backgroundColor: '#e8823c' },
  disabledButton: { backgroundColor: colors.disabled },
  actionButtonText: { fontSize: 15, fontWeight: '800', color: colors.bg },
  customBidRow: { flexDirection: 'row', gap: 8, marginBottom: 5 },
  customBidInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  customBidInputError: { borderColor: '#e0483e' },
  customBidButton: {
    backgroundColor: colors.pitch,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  customBidButtonText: { color: colors.textInverse, fontWeight: '800', fontSize: 14 },
  customBidErrorText: { color: '#ffb4b4', fontSize: 11, marginBottom: 6, fontWeight: '600' },
  passButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.textInverse,
    marginTop: 5,
  },
  passButtonText: { fontSize: 14, fontWeight: '700', color: colors.textInverse },
  budgetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 'auto',
    paddingTop: 12,
  },
  budgetChip: { fontWeight: '700', fontSize: 13 },
});
