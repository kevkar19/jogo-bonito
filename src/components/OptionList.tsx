import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function OptionList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; description: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.list}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            style={[styles.card, active && styles.cardActive]}
            onPress={() => onChange(opt.value)}
          >
            <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
              {active && <View style={styles.radioInner} />}
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
              <Text style={styles.description}>{opt.description}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  cardActive: { borderColor: colors.accent, backgroundColor: `${colors.accent}14` },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: { borderColor: colors.accent },
  radioInner: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.accent },
  textWrap: { flex: 1 },
  label: { fontSize: 13.5, fontWeight: '700', color: colors.text },
  labelActive: { color: colors.accent },
  description: { fontSize: 11.5, color: colors.textMuted, marginTop: 2, lineHeight: 15 },
});
