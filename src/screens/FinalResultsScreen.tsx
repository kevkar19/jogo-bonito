import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameState } from '../gameEngine';
import { matchWinner } from '../matchSim';
import { squadTotalOverall } from '../types';
import { colors, fonts } from '../theme';
import SquadCard from '../components/SquadCard';
import Confetti from '../components/Confetti';
import PitchBackground from '../components/PitchBackground';

export default function FinalResultsScreen({
  state,
  onPlayAgain,
}: {
  state: GameState;
  onPlayAgain: () => void;
}) {
  const total1 = squadTotalOverall(state.teams[1].squad);
  const total2 = squadTotalOverall(state.teams[2].squad);
  const showBudget = state.config.biddingMode !== 'draft';

  const usingMatchSim = state.config.endMode === 'matchSim' && state.matchResult !== null;
  const winner = usingMatchSim ? matchWinner(state.matchResult!) : total1 === total2 ? null : total1 > total2 ? 1 : 2;
  const isDraw = winner === null;
  const winnerName = winner ? state.teams[winner].name : null;

  return (
    <View style={styles.flex}>
      <PitchBackground />
      {winner && <Confetti side={winner === 1 ? 'left' : 'right'} />}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Final Results</Text>
        <Text style={styles.headline}>{isDraw ? "It's a draw!" : `${winnerName} wins!`}</Text>
        {usingMatchSim ? (
          <Text style={styles.subheadline}>
            Final score: {state.matchResult!.score[1]} - {state.matchResult!.score[2]}
          </Text>
        ) : (
          !isDraw && (
            <Text style={styles.subheadline}>
              {total1 > total2 ? total1 : total2} OVR vs {total1 > total2 ? total2 : total1} OVR
            </Text>
          )
        )}

        <View style={styles.squadsRow}>
          {/* Final results always reveal ratings in full, regardless of the hideRatings setting. */}
          <SquadCard
            team={state.teams[1]}
            accent={colors.team1}
            isWinner={winner === 1}
            hideRatings={false}
            showBudget={showBudget}
          />
          <View style={{ width: 12 }} />
          <SquadCard
            team={state.teams[2]}
            accent={colors.team2}
            isWinner={winner === 2}
            hideRatings={false}
            showBudget={showBudget}
          />
        </View>

        <Pressable style={styles.button} onPress={onPlayAgain}>
          <Text style={styles.buttonText}>Play Again</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  eyebrow: {
    color: colors.accent,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 6,
  },
  headline: {
    color: colors.textInverse,
    fontSize: 32,
    fontFamily: fonts.display,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subheadline: {
    color: '#c9dcd2',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  squadsRow: { flexDirection: 'row', marginTop: 20, marginBottom: 24 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { fontSize: 18, fontFamily: fonts.display, letterSpacing: 1, color: colors.bg },
});
