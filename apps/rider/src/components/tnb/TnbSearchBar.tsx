import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../../config/brand';
import { IconCalendar, IconSearch } from './TnbIcons';

type Props = {
  placeholder?: string;
  onPress: () => void;
  onSchedule?: () => void;
};

export function TnbSearchBar({ placeholder = 'Où allez-vous ?', onPress, onSchedule }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.bar, pressed && styles.pressed]}>
      <IconSearch color={colors.brand} size={22} />
      <Text style={styles.text}>{placeholder}</Text>
      <Pressable onPress={onSchedule} hitSlop={8} style={styles.cal} accessibilityLabel="Programmer une course">
        <IconCalendar color={colors.textMuted} size={20} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#111827',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  pressed: { transform: [{ scale: 0.99 }] },
  text: { flex: 1, marginLeft: 12, fontSize: 16, color: '#667085', fontWeight: '600' },
  cal: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F7F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
