import Ionicons from '@expo/vector-icons/build/Ionicons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export default function QuitConfirmModal({
  onCancel,
  onQuit,
}: {
  onCancel: () => void;
  onQuit: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 90 }),
    ]).start();
  }, [opacity, scale]);

  return (
    <View style={styles.backdrop}>
      <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
        <View style={styles.iconRing}>
          <Ionicons name="warning-outline" size={28} color="#e0483e" />
        </View>
        <Text style={styles.title}>Quit Game?</Text>
        <Text style={styles.body}>Your current game will be lost. This can't be undone.</Text>

        <Pressable style={[styles.button, styles.quitButton]} onPress={onQuit}>
          <Text style={styles.quitButtonText}>Quit Game</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
    elevation: 300,
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  iconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(224,72,62,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 22, fontFamily: fonts.display, color: colors.text, marginBottom: 8 },
  body: {
    fontSize: 13.5,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  quitButton: { backgroundColor: '#e0483e' },
  quitButtonText: { color: colors.textInverse, fontWeight: '800', fontSize: 15 },
  cancelButton: { backgroundColor: colors.surfaceAlt, marginBottom: 0 },
  cancelButtonText: { color: colors.text, fontWeight: '700', fontSize: 15 },
});
