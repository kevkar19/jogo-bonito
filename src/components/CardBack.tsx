import Ionicons from '@expo/vector-icons/build/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function CardBack() {
  return (
    <View style={styles.card}>
      <View style={styles.ring}>
        <Ionicons name="football" size={40} color={colors.accent} />
      </View>
      <Text style={styles.title}>JOGO BONITO</Text>
      <Text style={styles.subtitle}>???</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.pitch,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: colors.textInverse,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1.5,
  },
  subtitle: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 20,
    marginTop: 6,
  },
});
