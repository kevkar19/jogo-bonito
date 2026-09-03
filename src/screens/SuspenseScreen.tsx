import Ionicons from '@expo/vector-icons/build/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import PitchBackground from '../components/PitchBackground';

const DURATION_MS = 3000;
const MESSAGES = ['Tallying up the squads…', 'Adding up the ratings…', 'And the winner is…'];

export default function SuspenseScreen({ onFinish }: { onFinish: () => void }) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const glowPulse = useRef(new Animated.Value(0.6)).current;
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.6,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    spinLoop.start();
    pulseLoop.start();
    glowLoop.start();

    const messageInterval = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, MESSAGES.length - 1));
    }, DURATION_MS / MESSAGES.length);

    const finishTimer = setTimeout(onFinish, DURATION_MS);

    return () => {
      spinLoop.stop();
      pulseLoop.stop();
      glowLoop.stop();
      clearInterval(messageInterval);
      clearTimeout(finishTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <PitchBackground />
      <Animated.View style={[styles.glow, { opacity: glowPulse }]} />
      <Animated.View style={{ transform: [{ rotate }, { scale: pulse }] }}>
        <Ionicons name="trophy" size={96} color={colors.accent} />
      </Animated.View>
      <Text style={styles.message}>{MESSAGES[messageIndex]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,204,51,0.14)',
  },
  message: {
    color: colors.textInverse,
    fontSize: 19,
    fontFamily: fonts.display,
    letterSpacing: 0.3,
    marginTop: 30,
    textAlign: 'center',
  },
});
