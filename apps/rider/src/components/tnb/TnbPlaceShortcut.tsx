import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../config/brand';

type Props = {
  title: string;
  subtitle: string;
  onPress: () => void;
};

export function TnbPlaceShortcut({ title, subtitle, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
      <View style={styles.dot} />
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    width: '48%',
    backgroundColor: '#F7F7F5',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand, marginRight: 8 },
  text: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
