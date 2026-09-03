import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Fades and slides an element in shortly after mount. Used to stagger a
 * sequence of elements by passing increasing `delayMs` values.
 */
export function useFadeIn(delayMs: number, options?: { rise?: number; duration?: number }) {
  const rise = options?.rise ?? 14;
  const duration = options?.duration ?? 550;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(rise)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay: delayMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay: delayMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { opacity, transform: [{ translateY }] };
}
