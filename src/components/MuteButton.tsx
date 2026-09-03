import Ionicons from '@expo/vector-icons/build/Ionicons';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function MuteButton({
  muted,
  onToggle,
}: {
  muted: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.button} onPress={onToggle} hitSlop={10}>
      <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={20} color={colors.textInverse} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 50,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
