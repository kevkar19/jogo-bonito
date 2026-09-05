import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

/**
 * A shrinking countdown bar for timed bidding decisions. Restarts whenever
 * `resetKey` changes (a new turn, a new player, etc.) and fires `onExpire`
 * once when it reaches zero - callers decide what "running out of time"
 * means for the current mode (auto-pass, auto-skip, auto-submit a 0 bid).
 */
export default function BidTimer({
  seconds,
  resetKey,
  onExpire,
}: {
  seconds: number;
  resetKey: string;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const widthAnim = useRef(new Animated.Value(1)).current;
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(seconds);
    widthAnim.setValue(1);
    Animated.timing(widthAnim, {
      toValue: 0,
      duration: seconds * 1000,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);

    const timeout = setTimeout(() => {
      onExpireRef.current();
    }, seconds * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, seconds]);

  const urgent = remaining <= 3;

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: urgent ? '#e0483e' : colors.accent,
              width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
      <Text style={[styles.label, urgent && styles.labelUrgent]}>{remaining}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
  label: {
    fontSize: 13,
    fontFamily: fonts.display,
    color: colors.text,
    width: 30,
    textAlign: 'right',
  },
  labelUrgent: { color: '#e0483e' },
});
