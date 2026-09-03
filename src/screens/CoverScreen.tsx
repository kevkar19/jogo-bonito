import Ionicons from '@expo/vector-icons/build/Ionicons';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { useFadeIn } from '../hooks/useFadeIn';

const STRIPE_COUNT = 16;

export default function CoverScreen({ onStart }: { onStart: () => void }) {
  const ballFade = useFadeIn(0, { rise: 10 });
  const forSamFade = useFadeIn(280);
  const crestFade = useFadeIn(600, { rise: 10 });
  const bornFade = useFadeIn(850);
  const worldFade = useFadeIn(1100);
  const signatureFade = useFadeIn(1500);
  const buttonFade = useFadeIn(1900);

  return (
    <View style={styles.container}>
      <View style={styles.stripes} pointerEvents="none">
        {Array.from({ length: STRIPE_COUNT }).map((_, i) => (
          <View key={i} style={[styles.stripe, i % 2 === 0 ? styles.stripeA : styles.stripeB]} />
        ))}
      </View>

      <Ionicons
        name="football"
        size={280}
        color="rgba(255,204,51,0.05)"
        style={styles.watermark}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.ballRing, { opacity: ballFade.opacity, transform: ballFade.transform }]}>
          <Ionicons name="football" size={34} color={colors.accent} />
        </Animated.View>

        <Animated.Text
          style={[styles.forSam, { opacity: forSamFade.opacity, transform: forSamFade.transform }]}
        >
          For Sam.
        </Animated.Text>

        <Animated.View
          style={[styles.crestWrap, { opacity: crestFade.opacity, transform: crestFade.transform }]}
        >
          <View style={styles.crest}>
            <Ionicons name="star" size={11} color={colors.accent} style={styles.crestStar} />
            <Text style={styles.crestEst}>EST.</Text>
            <Text style={styles.crestYear}>2013</Text>
          </View>
        </Animated.View>

        <Animated.Text
          style={[styles.bornToPlay, { opacity: bornFade.opacity, transform: bornFade.transform }]}
        >
          Born to play.
        </Animated.Text>

        <Animated.Text
          style={[styles.worldBidding, { opacity: worldFade.opacity, transform: worldFade.transform }]}
        >
          One day, the world will be bidding for you.
        </Animated.Text>

        <Animated.View
          style={[
            styles.signatureWrap,
            { opacity: signatureFade.opacity, transform: signatureFade.transform },
          ]}
        >
          <View style={styles.signatureDivider} />
          <Text style={styles.signature}>Jogo Bonito</Text>
        </Animated.View>

        <Animated.View
          style={[styles.buttonWrap, { opacity: buttonFade.opacity, transform: buttonFade.transform }]}
        >
          <Pressable style={styles.button} onPress={onStart}>
            <Text style={styles.buttonText}>Start Game</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  stripes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
  },
  stripe: { flex: 1 },
  stripeA: { backgroundColor: colors.bg },
  stripeB: { backgroundColor: '#0d4633' },
  watermark: {
    position: 'absolute',
    alignSelf: 'center',
    top: '28%',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  ballRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  forSam: {
    color: colors.textInverse,
    fontSize: 30,
    fontStyle: 'italic',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 22,
  },
  crestWrap: { alignItems: 'center' },
  crest: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: colors.accent,
    backgroundColor: 'rgba(255,204,51,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crestStar: { marginBottom: 2 },
  crestEst: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  crestYear: { color: colors.textInverse, fontSize: 22, fontWeight: '900', marginTop: 1 },
  bornToPlay: {
    color: '#c9dcd2',
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 26,
  },
  worldBidding: {
    color: colors.accent,
    fontSize: 19,
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 27,
    marginBottom: 30,
    paddingHorizontal: 8,
  },
  signatureWrap: { alignItems: 'center', marginBottom: 40 },
  signatureDivider: {
    width: 44,
    height: 1.5,
    backgroundColor: colors.accent,
    opacity: 0.6,
    marginBottom: 12,
  },
  signature: {
    color: colors.accent,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 3,
  },
  buttonWrap: { width: '100%' },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '800', color: colors.bg, letterSpacing: 0.5 },
});
