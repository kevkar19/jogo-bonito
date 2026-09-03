import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PIECE_COLORS = ['#ffcc33', '#e0483e', '#2f7de1', '#17a589', '#8e44ad', '#ffffff'];
const PIECE_COUNT = 26;

interface Piece {
  x: number;
  color: string;
  width: number;
  height: number;
  delay: number;
  duration: number;
  rotateDir: number;
  drift: number;
}

function makePieces(xMin: number, xMax: number): Piece[] {
  return Array.from({ length: PIECE_COUNT }).map(() => ({
    x: xMin + Math.random() * (xMax - xMin),
    color: PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)],
    width: 5 + Math.random() * 5,
    height: 9 + Math.random() * 7,
    delay: Math.random() * 2200,
    duration: 2200 + Math.random() * 1600,
    rotateDir: Math.random() > 0.5 ? 1 : -1,
    drift: (Math.random() - 0.5) * 70,
  }));
}

function ConfettiPiece({ piece }: { piece: Piece }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    const run = () => {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: piece.duration,
        delay: piece.delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && mounted) run();
      });
    };
    run();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, SCREEN_HEIGHT * 0.65],
  });
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, piece.drift] });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${360 * piece.rotateDir}deg`],
  });
  const opacity = progress.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: piece.x,
        top: 0,
        width: piece.width,
        height: piece.height,
        backgroundColor: piece.color,
        borderRadius: 2,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    />
  );
}

/** Confetti falling from the top, concentrated over one side of the screen (or the full width). */
export default function Confetti({ side }: { side: 'left' | 'right' | 'full' }) {
  const xMin = side === 'right' ? SCREEN_WIDTH / 2 : 0;
  const xMax = side === 'left' ? SCREEN_WIDTH / 2 : SCREEN_WIDTH;
  const pieces = useRef(makePieces(xMin, xMax)).current;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {pieces.map((piece, i) => (
        <ConfettiPiece key={i} piece={piece} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
});
