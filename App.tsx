import { useEffect, useReducer, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { useFonts } from 'expo-font';
import { gameReducer, initialState } from './src/gameEngine';
import { colors } from './src/theme';
import CoverScreen from './src/screens/CoverScreen';
import SetupScreen from './src/screens/SetupScreen';
import ReadyScreen from './src/screens/ReadyScreen';
import BiddingScreen from './src/screens/BiddingScreen';
import AuctionResultScreen from './src/screens/AuctionResultScreen';
import SuspenseScreen from './src/screens/SuspenseScreen';
import FinalResultsScreen from './src/screens/FinalResultsScreen';
import MuteButton from './src/components/MuteButton';
import QuitButton from './src/components/QuitButton';
import QuitConfirmModal from './src/components/QuitConfirmModal';
import StartTransition from './src/components/StartTransition';
import { GameConfig } from './src/types';

const pregameSource = require('./assets/audio/pregame.mp3');
const gameSource = require('./assets/audio/game.mp3');
const clickSource = require('./assets/audio/click.wav');
const boomSource = require('./assets/audio/boom.wav');

const MUSIC_VOLUME = 0.4;
const CLICK_VOLUME = 0.5;
const BOOM_VOLUME = 0.9;

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState);
  const [showCover, setShowCover] = useState(true);
  const [showStartTransition, setShowStartTransition] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [muted, setMuted] = useState(false);

  // Self-hosted from our own assets (not @expo/vector-icons' node_modules
  // copy) - some static hosts silently drop anything under a "node_modules"
  // path, which left every icon glyph blank on the deployed web build.
  const [fontsLoaded] = useFonts({
    ionicons: require('./assets/fonts/Ionicons.ttf'),
  });

  // A game is actively in progress during these phases - that's when
  // quitting back to setup is offered and makes sense.
  const inActiveGame =
    state.phase === 'ready' || state.phase === 'bidding' || state.phase === 'auctionResult';

  const pregamePlayer = useAudioPlayer(pregameSource);
  const gamePlayer = useAudioPlayer(gameSource);
  const clickPlayer = useAudioPlayer(clickSource);
  const boomPlayer = useAudioPlayer(boomSource);

  // Pre-game track covers the cover screen and avatar/settings setup; the
  // game track takes over from the first round onward.
  const inGame = !showCover && state.phase !== 'setup';

  useEffect(() => {
    pregamePlayer.loop = true;
    gamePlayer.loop = true;
    pregamePlayer.volume = MUSIC_VOLUME;
    gamePlayer.volume = MUSIC_VOLUME;
    clickPlayer.volume = CLICK_VOLUME;
    boomPlayer.volume = BOOM_VOLUME;
    // Start on mount so music is already playing on the cover screen. On web,
    // browsers can block autoplay before any user gesture - the first button
    // taps below re-trigger play() as a fallback.
    pregamePlayer.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    pregamePlayer.muted = muted;
    gamePlayer.muted = muted;
  }, [pregamePlayer, gamePlayer, muted]);

  useEffect(() => {
    if (inGame) {
      pregamePlayer.pause();
      gamePlayer.play();
    } else {
      gamePlayer.pause();
      pregamePlayer.play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inGame]);

  const playClick = () => {
    if (muted) return;
    clickPlayer.seekTo(0).catch(() => {});
    clickPlayer.play();
  };

  const handleStartCover = () => {
    playClick();
    pregamePlayer.play();
    setShowCover(false);
  };

  const handleStart = (config: GameConfig) => {
    // The boom transition replaces the regular click for this one action.
    if (!muted) {
      boomPlayer.seekTo(0).catch(() => {});
      boomPlayer.play();
    }
    setShowStartTransition(true);
    dispatch({ type: 'START_GAME', config });
  };

  function withClick<Args extends unknown[]>(action: (...args: Args) => void) {
    return (...args: Args) => {
      playClick();
      action(...args);
    };
  }

  const handleQuitPress = withClick(() => setShowQuitConfirm(true));

  const handleCancelQuit = withClick(() => setShowQuitConfirm(false));

  const handleConfirmQuit = withClick(() => {
    setShowQuitConfirm(false);
    dispatch({ type: 'RESET' });
  });

  // Wait for the icon font before rendering - every screen uses Ionicons,
  // so a flash of blank/tofu glyphs isn't worth avoiding this brief gate.
  if (!fontsLoaded) {
    return <SafeAreaView style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {/* Music plays from the moment the app opens, so the mute toggle is available everywhere. */}
      <MuteButton muted={muted} onToggle={() => setMuted((m) => !m)} />
      {inActiveGame && <QuitButton onPress={handleQuitPress} />}
      {showCover && <CoverScreen onStart={handleStartCover} />}
      {!showCover && state.phase === 'setup' && <SetupScreen onStart={handleStart} />}
      {state.phase === 'ready' && (
        <ReadyScreen state={state} onReveal={withClick(() => dispatch({ type: 'REVEAL_NEXT' }))} />
      )}
      {state.phase === 'bidding' && (
        <BiddingScreen
          state={state}
          onRaise={withClick(() => dispatch({ type: 'RAISE' }))}
          onCustomBid={withClick((amount: number) => dispatch({ type: 'BID_CUSTOM', amount }))}
          onPass={withClick(() => dispatch({ type: 'PASS' }))}
        />
      )}
      {state.phase === 'auctionResult' && (
        <AuctionResultScreen
          state={state}
          onContinue={withClick(() => dispatch({ type: 'CONTINUE_AFTER_RESULT' }))}
        />
      )}
      {state.phase === 'suspense' && (
        <SuspenseScreen onFinish={() => dispatch({ type: 'FINISH_SUSPENSE' })} />
      )}
      {state.phase === 'gameOver' && (
        <FinalResultsScreen state={state} onPlayAgain={withClick(() => dispatch({ type: 'RESET' }))} />
      )}
      {showStartTransition && (
        <StartTransition onFinish={() => setShowStartTransition(false)} />
      )}
      {showQuitConfirm && (
        <QuitConfirmModal onCancel={handleCancelQuit} onQuit={handleConfirmQuit} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
