import { channels } from '@openride/realtime';
import { spacing, typography } from '@openride/ui';
import type { RouteProp } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import type { RootStackParamList } from '../../App';
import { colors, formatFare, radii } from '../config/brand';
import { useAppAuth } from '../features/auth/AuthProvider';
import { supabase } from '../lib/supabase';

type Props = { route: RouteProp<RootStackParamList, 'Trip'> };

interface TripRow {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  estimated_fare_cents: number | null;
  final_fare_cents: number | null;
  driver_id: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Course planifiée',
  requested: 'Recherche d’un chauffeur…',
  requires_manual_dispatch: 'Recherche d’un chauffeur…',
  assigned: 'Chauffeur assigné',
  driver_en_route: 'Le chauffeur est en route',
  arrived_at_pickup: 'Votre chauffeur est arrivé',
  in_progress: 'Course en cours',
  completed: 'Course terminée',
  cancelled: 'Course annulée',
  no_show: 'Absence au point de départ',
};

const ACTIVE = new Set([
  'requested',
  'requires_manual_dispatch',
  'scheduled',
  'assigned',
  'driver_en_route',
  'arrived_at_pickup',
  'in_progress',
]);

export function TripScreen({ route }: Props) {
  const { tripId } = route.params;
  const { state } = useAppAuth();
  const demoLocal = state.status === 'authenticated' && state.source === 'demo-local';
  const [trip, setTrip] = useState<TripRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demoLocal) {
      setTrip(null);
      setLoading(false);
      return;
    }
    let active = true;

    void supabase
      .from('trips')
      .select('id, status, pickup_address, dropoff_address, estimated_fare_cents, final_fare_cents, driver_id')
      .eq('id', tripId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) {
          setTrip(data as TripRow | null);
          setLoading(false);
        }
      });

    const channel = supabase
      .channel(channels.trip(tripId))
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` },
        (payload) => setTrip((prev) => ({ ...(prev ?? {}), ...(payload.new as TripRow) })),
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [tripId, demoLocal]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }
  if (!trip) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Course introuvable.</Text>
      </View>
    );
  }

  const isActive = ACTIVE.has(trip.status);
  const fareCents = trip.final_fare_cents ?? trip.estimated_fare_cents;

  return (
    <View style={styles.container}>
      <View style={[styles.statusBox, isActive ? styles.statusActive : styles.statusDone]}>
        {isActive && trip.status !== 'arrived_at_pickup' ? (
          <ActivityIndicator color={colors.white} style={{ marginBottom: spacing.sm }} />
        ) : null}
        <Text style={styles.statusText}>{STATUS_LABEL[trip.status] ?? trip.status}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.dot}>●</Text>
          <View style={styles.flex}>
            <Text style={styles.label}>Départ</Text>
            <Text style={styles.value}>{trip.pickup_address}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={[styles.dot, { color: colors.brand }]}>◆</Text>
          <View style={styles.flex}>
            <Text style={styles.label}>Arrivée</Text>
            <Text style={styles.value}>{trip.dropoff_address}</Text>
          </View>
        </View>

        {fareCents != null ? (
          <View style={styles.fareRow}>
            <Text style={styles.label}>{trip.final_fare_cents != null ? 'Tarif' : 'Estimation'}</Text>
            <Text style={styles.fare}>{formatFare(fareCents)}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.note}>
        Le suivi du chauffeur s’affiche ici dès qu’une course est acceptée. Cet écran se met à jour
        en temps réel.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  statusBox: { borderRadius: radii.lg, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl },
  statusActive: { backgroundColor: colors.brand },
  statusDone: { backgroundColor: colors.success },
  statusText: { color: colors.white, fontSize: typography.size.lg, fontWeight: '700' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.lg },
  dot: { fontSize: 14, marginRight: spacing.md, marginTop: 2, color: colors.textMuted },
  flex: { flex: 1 },
  label: { fontSize: typography.size.sm, color: colors.textMuted },
  value: { fontSize: typography.size.md, fontWeight: '500', color: colors.ink },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fare: { fontSize: typography.size.xl, fontWeight: '700', color: colors.ink },
  note: { marginTop: spacing.xl, color: colors.textMuted, fontSize: typography.size.sm, lineHeight: 20 },
  muted: { color: colors.textMuted },
});
