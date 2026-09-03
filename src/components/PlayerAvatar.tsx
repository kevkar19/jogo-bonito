import Ionicons from '@expo/vector-icons/build/Ionicons';
import { StyleSheet, View } from 'react-native';
import { Player } from '../types';
import { ICON_AVATAR, POSITION_AVATAR } from '../avatars';

export default function PlayerAvatar({ player, size = 64 }: { player: Player; size?: number }) {
  const spec = player.isIcon ? ICON_AVATAR : POSITION_AVATAR[player.position];
  const backgroundColor = player.isIcon ? '#3a2f0b' : `${spec.color}22`;

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderColor: spec.color,
          borderWidth: player.isIcon ? 3 : 2,
        },
      ]}
    >
      <Ionicons name={spec.icon} size={size * 0.5} color={spec.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
