import { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

/**
 * A card that renders face-down (back) and automatically flips to face-up
 * (front) shortly after mount. Pass a new `flipKey` (e.g. a player id) to
 * reset it back to face-down and replay the flip for a new reveal.
 */
export default function FlipCard({
  flipKey,
  front,
  back,
  height,
  autoFlipDelay = 450,
  flipDuration = 550,
  onFlipped,
}: {
  flipKey: string;
  front: ReactNode;
  back: ReactNode;
  height: number;
  autoFlipDelay?: number;
  flipDuration?: number;
  onFlipped?: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current; // 0 = face-down, 1 = face-up
  const [scale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    anim.setValue(0);
    const timer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.06,
          duration: flipDuration / 2,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: flipDuration / 2,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
      Animated.timing(anim, {
        toValue: 1,
        duration: flipDuration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onFlipped?.();
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, autoFlipDelay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipKey]);

  const rotateBack = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const rotateFront = anim.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] });

  return (
    <View style={[styles.wrapper, { height }]}>
      <Animated.View
        style={[
          styles.face,
          { transform: [{ perspective: 1200 }, { scale }, { rotateY: rotateBack }] },
        ]}
      >
        {back}
      </Animated.View>
      <Animated.View
        style={[
          styles.face,
          { transform: [{ perspective: 1200 }, { scale }, { rotateY: rotateFront }] },
        ]}
      >
        {front}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  face: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
  },
});
