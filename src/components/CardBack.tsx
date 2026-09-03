import Ionicons from '@expo/vector-icons/build/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function CardBack() {
  return (
    <LinearGradient colors={[colors.pitch, colors.bg]} style={styles.card}>
      <View style={styles.cornerTL} />
      <View style={styles.cornerBR} />
      <View style={styles.ring}>
        <View style={styles.ringInner}>
          <Ionicons name="football" size={64} color={colors.accent} />
        </View>
      </View>
      <Text style={styles.title}>JOGO BONITO</Text>
      <Text style={styles.subtitle}>???</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,204,51,0.08)',
  },
  cornerBR: {
    position: 'absolute',
    bottom: -70,
    right: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,204,51,0.06)',
  },
  ring: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  ringInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: 'rgba(255,204,51,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.textInverse,
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: 2.5,
  },
  subtitle: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 30,
    marginTop: 8,
  },
});
