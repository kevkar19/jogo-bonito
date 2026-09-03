import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

const HOLD_MS = 1300;
const FADE_MS = 550;

/**
 * Full-screen opaque overlay used for the start-game transition: holds a
 * brief blackout, then fades itself out to reveal the game underneath
 * (which is already rendering behind it). Blocks touches while active.
 */
export default function StartTransition({ onFinish }: { onFinish: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const holdTimer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onFinish();
      });
    }, HOLD_MS);
    return () => clearTimeout(holdTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Animated.View style={[styles.overlay, { opacity }]} />;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 200,
    elevation: 200,
  },
});
