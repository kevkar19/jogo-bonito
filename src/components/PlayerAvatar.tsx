import Ionicons from '@expo/vector-icons/build/Ionicons';
import { Image, StyleSheet, View } from 'react-native';
import { Player } from '../types';
import { POSITION_AVATAR } from '../avatars';
import { ICON_PHOTOS } from '../iconPhotos';

export default function PlayerAvatar({ player, size = 64 }: { player: Player; size?: number }) {
  const posSpec = POSITION_AVATAR[player.position];
  const photo = ICON_PHOTOS[player.name];

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: `${posSpec.color}22`,
          borderColor: posSpec.color,
          borderWidth: 2,
        },
      ]}
    >
      {photo ? (
        <Image
          source={photo}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        // Every player is a real named footballer, but not all have a
        // photo - a generic person silhouette in the position's color reads
        // as "real person, no picture" rather than a fictional filler.
        <Ionicons name="person" size={size * 0.55} color={posSpec.color} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
