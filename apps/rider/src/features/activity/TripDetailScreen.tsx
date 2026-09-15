import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OverlayHeader } from '../../components/tnb/OverlayHeader';
import { ScreenEnter } from '../../components/tnb/ScreenEnter';
import { TnbButton } from '../../components/tnb/TnbButton';
import { colors, formatFare, vehicleCategoryById } from '../../config/brand';
import { examplePlaces } from '../../config/brand';
import { useHomeStore } from '../home/homeStore';
import { useShellStore } from '../../navigation/shellStore';
import type { ActivityRide } from './activityTypes';

export function TripDetailScreen({ ride, onBack }: { ride: ActivityRide; onBack: () => void }) {
  const category = vehicleCategoryById(ride.categoryId);
  const selectDestination = useHomeStore((s) => s.selectDestination);
  const setTab = useShellStore((s) => s.setTab);
  const push = useShellStore((s) => s.push);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenEnter>
        <OverlayHeader title="Détail de la course" subtitle={ride.reference} onBack={onBack} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.mapPreview}>
            <View style={styles.routeLine} />
            <Text style={styles.mapCity}>Kinshasa</Text>
            <Text style={styles.from} numberOfLines={2}>
              {ride.pickupLabel}
            </Text>
            <Text style={styles.to} numberOfLines={2}>
              {ride.dropoffLabel}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Chauffeur</Text>
            <Text style={styles.value}>{ride.driverName ?? 'À attribuer'}</Text>
            <Text style={styles.meta}>
              {ride.vehicle ?? category.label}
              {ride.plate ? ` · ${ride.plate}` : ''}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Montant</Text>
            <Text style={styles.value}>
              {ride.estimated ? 'Estimé · ' : ''}
              {formatFare(ride.fareCents)}
            </Text>
            <Text style={styles.meta}>{ride.payment}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Référence</Text>
            <Text style={styles.value}>{ride.reference}</Text>
            <Pressable
              onPress={() => Alert.alert('Reçu', `${ride.reference}\n${formatFare(ride.fareCents)} · ${ride.payment}`)}
              accessibilityLabel="Voir le reçu"
            >
              <Text style={styles.link}>Voir le reçu</Text>
            </Pressable>
          </View>

          <TnbButton
            label="Commander à nouveau"
            onPress={() => {
              const known = examplePlaces.find((place) => {
                const prefix = place.label.split(',')[0] ?? '';
                return prefix.length > 0 && ride.dropoffLabel.includes(prefix);
              });
              selectDestination({
                lat: ride.dropoffLat ?? known?.lat ?? -4.305,
                lng: ride.dropoffLng ?? known?.lng ?? 15.303,
                label: ride.dropoffLabel,
              });
              setTab('home');
            }}
          />
          <View style={{ height: 10 }} />
          <TnbButton label="Signaler un problème" variant="ghost" onPress={() => push({ id: 'report' })} />
        </ScrollView>
      </ScreenEnter>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  mapPreview: {
    height: 150,
    borderRadius: 22,
    backgroundColor: '#E7EDE4',
    marginBottom: 14,
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'flex-end',
  },
  routeLine: {
    position: 'absolute',
    left: 28,
    top: 24,
    bottom: 24,
    width: 3,
    backgroundColor: colors.brand,
    borderRadius: 2,
  },
  mapCity: { position: 'absolute', right: 14, top: 12, color: 'rgba(17,24,39,0.35)', fontWeight: '800' },
  from: { fontWeight: '800', color: colors.ink },
  to: { marginTop: 6, fontWeight: '700', color: colors.brand },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  label: { color: colors.textMuted, fontWeight: '700', marginBottom: 4 },
  value: { fontSize: 17, fontWeight: '800', color: colors.ink },
  meta: { marginTop: 4, color: colors.textMuted },
  link: { marginTop: 10, color: colors.brand, fontWeight: '700' },
});
