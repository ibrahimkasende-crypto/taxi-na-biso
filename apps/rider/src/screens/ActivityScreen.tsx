import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenEnter } from '../components/tnb/ScreenEnter';
import { TnbEmptyState } from '../components/tnb/TnbEmptyState';
import { TnbSkeleton } from '../components/tnb/TnbSkeleton';
import { colors, formatFare } from '../config/brand';
import { ActivityTripCard } from '../features/activity/ActivityTripCard';
import { loadActivityRides } from '../features/activity/activityService';
import { computeActivityStats, filterActivityRides } from '../features/activity/activityStats';
import { useActivityStore } from '../features/activity/activityStore';
import type { ActivityFilter } from '../features/activity/activityTypes';
import { useAppAuth } from '../features/auth/AuthProvider';
import { useHomeStore } from '../features/home/homeStore';
import { useShellStore } from '../navigation/shellStore';

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'completed', label: 'Terminées' },
  { id: 'scheduled', label: 'Programmées' },
  { id: 'cancelled', label: 'Annulées' },
];

export function ActivityScreen() {
  const { state } = useAppAuth();
  const localTrips = useHomeStore((s) => s.trips);
  const push = useShellStore((s) => s.push);
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const rides = useActivityStore((s) => s.rides);
  const setRides = useActivityStore((s) => s.setRides);
  const [usingDemoCatalog, setUsingDemoCatalog] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const userId = state.status === 'authenticated' && state.source === 'supabase' ? state.session.user.id : null;
    const source = state.status === 'authenticated' ? state.source : null;
    void loadActivityRides({ userId, source, localTrips }).then((result) => {
      if (!mounted) return;
      setRides(result.rides);
      setUsingDemoCatalog(result.usingDemoCatalog);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [localTrips, setRides, state]);

  const stats = useMemo(() => computeActivityStats(rides, usingDemoCatalog), [rides, usingDemoCatalog]);
  const visible = useMemo(() => {
    const filtered = filterActivityRides(rides, filter);
    const q = query.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter(
      (ride) =>
        ride.pickupLabel.toLowerCase().includes(q) ||
        ride.dropoffLabel.toLowerCase().includes(q) ||
        (ride.driverName ?? '').toLowerCase().includes(q),
    );
  }, [filter, query, rides]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenEnter>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Mes activités</Text>
              <Text style={styles.sub}>Retrouvez toutes vos courses</Text>
            </View>
          </View>

          <View style={styles.stats}>
            <StatCard label="Courses" value={String(stats.trips)} />
            <StatCard label="Dépenses" value={formatFare(stats.spendCents)} />
            <StatCard label="Distance" value={`${stats.distanceKm} km`} />
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher une course"
            placeholderTextColor={colors.textMuted}
            style={styles.search}
            accessibilityLabel="Rechercher une course"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {FILTERS.map((item) => {
              const active = filter === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setFilter(item.id)}
                  style={[styles.chip, active && styles.chipOn]}
                  accessibilityLabel={item.label}
                >
                  <Text style={[styles.chipText, active && styles.chipTextOn]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {loading ? (
            <View style={{ marginTop: 12 }}>
              <TnbSkeleton height={88} />
              <TnbSkeleton height={88} />
            </View>
          ) : visible.length === 0 ? (
            <TnbEmptyState title="Aucune course" subtitle="Vos trajets apparaîtront ici après une commande." />
          ) : (
            visible.map((ride) => (
              <ActivityTripCard key={ride.id} ride={ride} onPress={() => push({ id: 'tripDetail', tripId: ride.id })} />
            ))
          )}
        </ScrollView>
      </ScreenEnter>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink },
  sub: { marginTop: 4, color: colors.textMuted, fontWeight: '600' },
  stats: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  statValue: { fontSize: 15, fontWeight: '800', color: colors.ink },
  statLabel: { marginTop: 4, fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  search: {
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#EEF0F3',
    paddingHorizontal: 14,
    color: colors.ink,
    marginBottom: 12,
  },
  filters: { paddingBottom: 12, gap: 8 },
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#EEF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { fontWeight: '700', color: colors.textMuted },
  chipTextOn: { color: colors.white },
});
