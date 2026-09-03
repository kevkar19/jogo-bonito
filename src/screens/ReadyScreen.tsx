import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GameState } from '../gameEngine';
import { colors } from '../theme';
import SquadCard from '../components/SquadCard';

export default function ReadyScreen({
  state,
  onReveal,
}: {
  state: GameState;
  onReveal: () => void;
}) {
  const playersAuctioned = 10 - state.pool.length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Pass the device to both players</Text>
      <Text style={styles.title}>Ready for the next player?</Text>
      <Text style={styles.progressText}>
        {playersAuctioned} of 10 players auctioned
      </Text>

      <View style={styles.squadsRow}>
        <SquadCard
          team={state.teams[1]}
          accent={colors.team1}
          isWinner={false}
          hideRatings={state.config.hideRatings}
        />
        <View style={styles.divider} />
        <SquadCard
          team={state.teams[2]}
          accent={colors.team2}
          isWinner={false}
          hideRatings={state.config.hideRatings}
        />
      </View>

      <Pressable style={styles.button} onPress={onReveal}>
        <Text style={styles.buttonText}>Reveal Next Player</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bg,
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
    fontSize: 24,
    fontWeight: '800',
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
  buttonText: { fontSize: 16, fontWeight: '800', color: colors.bg },
});
