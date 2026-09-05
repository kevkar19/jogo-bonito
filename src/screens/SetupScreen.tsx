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
import {
  AvatarId,
  BiddingMode,
  EndMode,
  FORMATIONS,
  FormationId,
  GameConfig,
  PlayerPoolMode,
  POSITION_LABELS,
} from '../types';
import { colors, fonts } from '../theme';
import AvatarPicker from '../components/AvatarPicker';
import PitchBackground from '../components/PitchBackground';
import SegmentedControl from '../components/SegmentedControl';
import OptionList from '../components/OptionList';

const BIDDING_MODE_OPTIONS: { value: BiddingMode; label: string; description: string }[] = [
  { value: 'auction', label: 'Open Auction', description: 'Classic ascending bidding war - raise or pass until one side backs down.' },
  { value: 'draft', label: 'Snake Draft', description: 'No coins - on your turn, take the revealed player for free or skip them.' },
  { value: 'sealed', label: 'Sealed Bids', description: 'Both sides secretly submit one bid, hand the device back and forth, then reveal.' },
];

const FORMATION_OPTIONS: { value: FormationId; label: string; description: string }[] = (
  Object.keys(FORMATIONS) as FormationId[]
).map((id) => ({ value: id, label: FORMATIONS[id].label, description: FORMATIONS[id].description }));

const TIMER_OPTIONS: { value: string; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: '10', label: '10s' },
  { value: '15', label: '15s' },
  { value: '30', label: '30s' },
];

const END_MODE_OPTIONS: { value: EndMode; label: string }[] = [
  { value: 'ovr', label: 'Total Rating' },
  { value: 'matchSim', label: 'Match Sim' },
];

const POOL_OPTIONS: { value: PlayerPoolMode; label: string }[] = [
  { value: 'all', label: 'All Players' },
  { value: 'iconsOnly', label: 'Icons Only' },
];

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
  const [biddingMode, setBiddingMode] = useState<BiddingMode>('auction');
  const [playerPool, setPlayerPool] = useState<PlayerPoolMode>('all');
  const [formation, setFormation] = useState<FormationId>('classic');
  const [endMode, setEndMode] = useState<EndMode>('ovr');
  const [timerChoice, setTimerChoice] = useState('off');
  const [error, setError] = useState<string | null>(null);

  const isDraft = biddingMode === 'draft';

  const handleStart = () => {
    const startingBudget = parseInt(budgetText, 10);
    const bidIncrement = parseInt(incrementText, 10);

    if (!isDraft) {
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
    }
    if (team1Avatar === team2Avatar) {
      setError('Pick two different avatars so you can tell your squads apart.');
      return;
    }

    setError(null);
    onStart({
      startingBudget: isDraft ? 0 : startingBudget,
      bidIncrement: isDraft ? 1 : bidIncrement,
      team1Name: team1Name.trim() || 'Player 1',
      team2Name: team2Name.trim() || 'Player 2',
      team1Avatar,
      team2Avatar,
      hideRatings,
      biddingMode,
      playerPool,
      endMode,
      formation,
      timerSeconds: timerChoice === 'off' ? null : parseInt(timerChoice, 10),
    });
  };

  const req = FORMATIONS[formation].requirements;
  const squadHint = `Each squad needs ${req.GK} ${POSITION_LABELS.GK}, ${req.DEF} ${POSITION_LABELS.DEF}, ${req.CM} ${POSITION_LABELS.CM}, and ${req.ST} ${POSITION_LABELS.ST}.`;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <PitchBackground />
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
          <Text style={styles.sectionLabel}>Player Pool</Text>
          <SegmentedControl options={POOL_OPTIONS} value={playerPool} onChange={setPlayerPool} />
          <Text style={styles.hint}>
            {playerPool === 'iconsOnly'
              ? 'Only the curated real-world Icons show up - every player has a photo.'
              : 'A mix of curated Icons (with photos) and generated fictional players.'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Bidding Style</Text>
          <OptionList options={BIDDING_MODE_OPTIONS} value={biddingMode} onChange={setBiddingMode} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Formation</Text>
          <OptionList options={FORMATION_OPTIONS} value={formation} onChange={setFormation} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Match Finish</Text>
          <SegmentedControl options={END_MODE_OPTIONS} value={endMode} onChange={setEndMode} />
          <Text style={styles.hint}>
            {endMode === 'matchSim'
              ? 'Squads face off in a simulated match - final score decides the winner.'
              : 'Highest combined squad rating wins.'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Bid Timer</Text>
          <SegmentedControl options={TIMER_OPTIONS} value={timerChoice} onChange={setTimerChoice} />
          <Text style={styles.hint}>
            {timerChoice === 'off'
              ? 'No time limit on bidding decisions.'
              : `Each decision has ${timerChoice} seconds before it auto-passes.`}
          </Text>
        </View>

        {!isDraft && (
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
            <Text style={styles.hint}>{squadHint} Highest total rating wins.</Text>

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
        )}

        {isDraft && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Rules</Text>
            <Text style={styles.hint}>{squadHint} No coins are spent in draft mode - highest total rating wins.</Text>
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
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Start Game</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: {
    padding: 20,
    paddingTop: 60,
    flexGrow: 1,
  },
  title: {
    fontSize: 36,
    fontFamily: fonts.display,
    letterSpacing: 1,
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
  buttonText: { fontSize: 18, fontFamily: fonts.display, letterSpacing: 1, color: colors.bg },
});
