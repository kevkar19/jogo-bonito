import Ionicons from '@expo/vector-icons/build/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AvatarId } from '../types';
import { AVATAR_OPTIONS } from '../avatars';
import { colors } from '../theme';

export default function AvatarPicker({
  selected,
  onSelect,
}: {
  selected: AvatarId;
  onSelect: (id: AvatarId) => void;
}) {
  return (
    <View style={styles.row}>
      {AVATAR_OPTIONS.map((option) => {
        const isSelected = option.id === selected;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[
              styles.circle,
              { borderColor: option.color },
              isSelected && { backgroundColor: option.color },
            ]}
          >
            <Ionicons
              name={option.icon}
              size={20}
              color={isSelected ? colors.textInverse : option.color}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 4 },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
