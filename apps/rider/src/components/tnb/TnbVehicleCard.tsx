import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, formatFare, type VehicleCategory } from '../../config/brand';

type Props = {
  category: VehicleCategory;
  etaMinutes: number;
  seats: number;
  fareCents: number;
  selected: boolean;
  onPress: () => void;
};

export function TnbVehicleCard({ category, etaMinutes, seats, fareCents, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}
    >
      <View style={[styles.icon, selected && styles.iconOn]}>
        <View style={[styles.carBody, selected && styles.carOn]} />
      </View>
      <View style={styles.meta}>
        <Text style={styles.name}>{category.label}</Text>
        <Text style={styles.sub}>{category.description}</Text>
        <Text style={styles.eta}>
          {etaMinutes} min · {seats} place{seats > 1 ? 's' : ''}
        </Text>
      </View>
      <Text style={styles.price}>{formatFare(fareCents)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: colors.white,
    padding: 12,
    marginBottom: 10,
  },
  selected: {
    borderColor: colors.brand,
    backgroundColor: '#FFF4EF',
  },
  pressed: { transform: [{ scale: 0.99 }] },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconOn: { backgroundColor: '#FFE4D6' },
  carBody: {
    width: 26,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#111827',
  },
  carOn: { backgroundColor: colors.brand },
  meta: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  eta: { fontSize: 12, color: colors.ink, marginTop: 4, fontWeight: '600' },
  price: { fontSize: 16, fontWeight: '800', color: colors.ink },
});
