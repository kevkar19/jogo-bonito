import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AvatarId, GameConfig } from '../types';
import { colors } from '../theme';
import AvatarPicker from '../components/AvatarPicker';

export default function SetupScreen({
  onStart,
}: {
  onStart: (config: GameConfig) => void;
}) {
  const [team1Name, setTeam1Name] = useState('Player 1');
  const [team2Name, setTeam2Name] = useState('Player 2');
  const [team1Avatar, setTeam1Avatar] = useState<AvatarId>('flame');
  const [team2Avatar, setTeam2Avatar] = useState<AvatarId>('shield');
  const [budgetText, setBudgetText] = useState('100');
  const [incrementText, setIncrementText] = useState('5');
  const [hideRatings, setHideRatings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    const startingBudget = parseInt(budgetText, 10);
    const bidIncrement = parseInt(incrementText, 10);

    if (!Number.isFinite(startingBudget) || startingBudget <= 0) {
      setError('Starting budget must be a positive number.');
      return;
    }
    if (!Number.isFinite(bidIncrement) || bidIncrement <= 0) {
      setError('Bid increment must be a positive number.');
      return;
    }
    if (bidIncrement > startingBudget) {
      setError('Bid increment cannot be larger than the starting budget.');
      return;
    }
    if (team1Avatar === team2Avatar) {
      setError('Pick two different avatars so you can tell your squads apart.');
      return;
    }

    setError(null);
    onStart({
      startingBudget,
      bidIncrement,
      team1Name: team1Name.trim() || 'Player 1',
      team2Name: team2Name.trim() || 'Player 2',
      team1Avatar,
      team2Avatar,
      hideRatings,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Jogo Bonito</Text>
        <Text style={styles.subtitle}>Soccer Squad Auction</Text>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Players</Text>
          <Text style={styles.fieldLabel}>Player 1 name</Text>
          <TextInput
            style={styles.input}
            value={team1Name}
            onChangeText={setTeam1Name}
            placeholder="Player 1"
            maxLength={20}
          />
          <AvatarPicker selected={team1Avatar} onSelect={setTeam1Avatar} />

          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Player 2 name</Text>
          <TextInput
            style={styles.input}
            value={team2Name}
            onChangeText={setTeam2Name}
            placeholder="Player 2"
            maxLength={20}
          />
          <AvatarPicker selected={team2Avatar} onSelect={setTeam2Avatar} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Rules</Text>
          <Text style={styles.fieldLabel}>Starting budget (coins)</Text>
          <TextInput
            style={styles.input}
            value={budgetText}
            onChangeText={setBudgetText}
            keyboardType="number-pad"
          />
          <Text style={styles.fieldLabel}>Bid increment (coins)</Text>
          <TextInput
            style={styles.input}
            value={incrementText}
            onChangeText={setIncrementText}
            keyboardType="number-pad"
          />
          <Text style={styles.hint}>
            Each squad needs 1 GK, 1 DEF, 2 CM, and 1 ST. Highest total rating wins.
          </Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <Text style={styles.toggleLabel}>Hide overall ratings</Text>
              <Text style={styles.toggleHint}>
                Only status badges (Common/Rare/Elite/Legendary) show during play.
              </Text>
            </View>
            <Switch
              value={hideRatings}
              onValueChange={setHideRatings}
              trackColor={{ false: colors.disabled, true: colors.pitch }}
              thumbColor={colors.surface}
            />
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Start Game</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.bg,
    flexGrow: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textInverse,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  fieldLabel: { fontSize: 13, color: colors.text, marginBottom: 4, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
  },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: 12, lineHeight: 17 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  toggleTextWrap: { flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 3 },
  toggleHint: { fontSize: 11.5, color: colors.textMuted, lineHeight: 15 },
  error: { color: '#ffb4b4', textAlign: 'center', marginBottom: 12, fontWeight: '600' },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { fontSize: 16, fontWeight: '800', color: colors.bg },
});
