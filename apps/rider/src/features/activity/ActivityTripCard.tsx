import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, formatFare, vehicleCategoryById } from '../../config/brand';
import type { ActivityRide } from './activityTypes';

const STATUS_LABEL: Record<ActivityRide['status'], string> = {
  completed: 'Terminée',
  scheduled: 'Programmée',
  cancelled: 'Annulée',
  active: 'En cours',
};

const STATUS_COLOR: Record<ActivityRide['status'], string> = {
  completed: colors.success,
  scheduled: colors.brand,
  cancelled: colors.danger,
  active: colors.brand,
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const same =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const time = date.toLocaleTimeString('fr-CD', { hour: '2-digit', minute: '2-digit' });
  if (same) return `Aujourd’hui, ${time}`;
  return `${date.toLocaleDateString('fr-CD', { day: 'numeric', month: 'long', year: 'numeric' })}, ${time}`;
}

export function ActivityTripCard({ ride, onPress }: { ride: ActivityRide; onPress: () => void }) {
  const category = vehicleCategoryById(ride.categoryId);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityLabel={`${ride.pickupLabel} vers ${ride.dropoffLabel}`}
    >
      <View style={styles.icon}>
        <Text style={styles.iconText}>{ride.categoryId === 'moto' ? 'M' : 'V'}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.routeRow}>
          <View style={styles.timeline}>
            <View style={styles.dotStart} />
            <View style={styles.line} />
            <View style={styles.dotEnd} />
          </View>
          <View style={styles.labels}>
            <Text style={styles.place} numberOfLines={1}>
              {ride.pickupLabel}
            </Text>
            <Text style={styles.place} numberOfLines={1}>
              {ride.dropoffLabel}
            </Text>
          </View>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {formatWhen(ride.occurredAt)} · {ride.driverName ?? 'À attribuer'} · {category.label}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>
            {ride.estimated ? 'Estimé ' : ''}
            {formatFare(ride.fareCents)}
          </Text>
          <View style={[styles.badge, { backgroundColor: `${STATUS_COLOR[ride.status]}18` }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLOR[ride.status] }]}>{STATUS_LABEL[ride.status]}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  pressed: { transform: [{ scale: 0.985 }] },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFF1EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconText: { color: colors.brand, fontWeight: '800' },
  body: { flex: 1 },
  routeRow: { flexDirection: 'row' },
  timeline: { width: 12, alignItems: 'center', marginRight: 8, paddingTop: 4 },
  dotStart: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.ink },
  line: { width: 2, flex: 1, minHeight: 14, backgroundColor: '#E5E7EB', marginVertical: 3 },
  dotEnd: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand },
  labels: { flex: 1 },
  place: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 4 },
  meta: { marginTop: 4, fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  footer: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontWeight: '800', color: colors.ink },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  chevron: { fontSize: 24, color: '#9CA3AF', marginLeft: 6 },
});
