import Ionicons from '@expo/vector-icons/build/Ionicons';
import { StyleSheet, View } from 'react-native';
import { AvatarId } from '../types';
import { getAvatarOption } from '../avatars';

export default function TeamAvatar({ avatarId, size = 28 }: { avatarId: AvatarId; size?: number }) {
  const option = getAvatarOption(avatarId);
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: `${option.color}22`,
          borderColor: option.color,
        },
      ]}
    >
      <Ionicons name={option.icon} size={size * 0.58} color={option.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
