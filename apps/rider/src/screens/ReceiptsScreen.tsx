import { spacing, typography } from '@openride/ui';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { colors, formatFare, radii } from '../config/brand';
import { useAppAuth } from '../features/auth/AuthProvider';
import { supabase } from '../lib/supabase';

interface Receipt {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  final_fare_cents: number | null;
  estimated_fare_cents: number | null;
  payment_status: string;
  completed_at: string | null;
}

const PAYMENT_LABEL: Record<string, string> = {
  paid: 'Payé',
  pending: 'Paiement en attente',
  authorised: 'Autorisé',
  failed: 'Paiement échoué',
  refunded: 'Remboursé',
  waived: 'Exonéré',
};

export function ReceiptsScreen() {
  const { state } = useAppAuth();
  const demoLocal = state.status === 'authenticated' && state.source === 'demo-local';
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demoLocal) {
      setReceipts([]);
      setLoading(false);
      return;
    }
    let active = true;
    void supabase
      .from('trips')
      .select(
        'id, status, pickup_address, dropoff_address, final_fare_cents, estimated_fare_cents, payment_status, completed_at',
      )
      .in('status', ['completed', 'cancelled', 'no_show'])
      .order('completed_at', { ascending: false, nullsFirst: false })
      .limit(50)
      .then(({ data }) => {
        if (!active) return;
        setReceipts((data as Receipt[]) ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [demoLocal]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={{ padding: spacing.lg }}
      data={receipts}
      keyExtractor={(r) => r.id}
      ListEmptyComponent={<Text style={styles.muted}>Aucune course passée pour le moment.</Text>}
      renderItem={({ item }) => {
        const fare = item.final_fare_cents ?? item.estimated_fare_cents;
        return (
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.route} numberOfLines={1}>
                {item.pickup_address} → {item.dropoff_address}
              </Text>
              <Text style={styles.meta}>
                {item.completed_at
                  ? new Date(item.completed_at).toLocaleDateString('fr-CD')
                  : item.status}{' '}
                · {PAYMENT_LABEL[item.payment_status] ?? item.payment_status}
              </Text>
            </View>
            <Text style={styles.fare}>{fare != null ? formatFare(fare) : '—'}</Text>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  flex: { flex: 1, marginRight: spacing.md },
  route: { fontSize: typography.size.md, fontWeight: '500', color: colors.ink },
  meta: { fontSize: typography.size.sm, color: colors.textMuted, marginTop: 2 },
  fare: { fontSize: typography.size.lg, fontWeight: '700', color: colors.ink },
  muted: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});
