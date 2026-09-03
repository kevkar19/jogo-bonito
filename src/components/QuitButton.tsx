import Ionicons from '@expo/vector-icons/build/Ionicons';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function QuitButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.button} onPress={onPress} hitSlop={10}>
      <Ionicons name="log-out-outline" size={20} color={colors.textInverse} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 50,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
