import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameState } from '../gameEngine';
import { colors, fonts } from '../theme';
import SquadCard from '../components/SquadCard';
import PitchBackground from '../components/PitchBackground';

export default function ReadyScreen({
  state,
  onReveal,
}: {
  state: GameState;
  onReveal: () => void;
}) {
  const playersAuctioned = state.totalPlayers - state.pool.length;
  const showBudget = state.config.biddingMode !== 'draft';

  return (
    <View style={styles.flex}>
      <PitchBackground />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Pass the device to both players</Text>
        <Text style={styles.title}>Ready for the next player?</Text>
        <Text style={styles.progressText}>
          {playersAuctioned} of {state.totalPlayers} players auctioned
        </Text>

        <View style={styles.squadsRow}>
          <SquadCard
            team={state.teams[1]}
            accent={colors.team1}
            isWinner={false}
            hideRatings={state.config.hideRatings}
            showBudget={showBudget}
          />
          <View style={styles.divider} />
          <SquadCard
            team={state.teams[2]}
            accent={colors.team2}
            isWinner={false}
            hideRatings={state.config.hideRatings}
            showBudget={showBudget}
          />
        </View>

        <Pressable style={styles.button} onPress={onReveal}>
          <Text style={styles.buttonText}>Reveal Next Player</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  eyebrow: {
    color: colors.accent,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 8,
  },
  title: {
    color: colors.textInverse,
    fontSize: 28,
    fontFamily: fonts.display,
    textAlign: 'center',
    marginBottom: 6,
  },
  progressText: {
    color: '#c9dcd2',
    textAlign: 'center',
    marginBottom: 20,
  },
  squadsRow: {
    flexDirection: 'row',
    marginBottom: 28,
  },
  divider: { width: 12 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { fontSize: 17, fontFamily: fonts.display, letterSpacing: 0.5, color: colors.bg },
});
