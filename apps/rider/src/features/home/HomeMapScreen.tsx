import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TnbBottomSheet } from '../../components/tnb/TnbBottomSheet';
import { TnbButton } from '../../components/tnb/TnbButton';
import { TnbDriverCard } from '../../components/tnb/TnbDriverCard';
import { TnbIconButton } from '../../components/tnb/TnbIconButton';
import { TnbStatusPill } from '../../components/tnb/TnbStatusPill';
import { TnbVehicleCard } from '../../components/tnb/TnbVehicleCard';
import { IconLocate } from '../../components/tnb/TnbIcons';
import { colors, examplePlaces, formatFare, vehicleCategories, vehicleCategoryById } from '../../config/brand';
import { isDevAuthBypass } from '../auth/demo/demoAuthEnabled';
import { useAppAuth } from '../auth/AuthProvider';
import { unreadCount, useNotificationStore } from '../notifications/notificationStore';
import { useShellStore } from '../../navigation/shellStore';
import { DestinationSearchBar } from './components/DestinationSearchBar';
import { HomeBottomPanel } from './components/HomeBottomPanel';
import { HomeHeader } from './components/HomeHeader';
import { SavePlaceModal } from './components/SavePlaceModal';
import { ScheduleRideModal } from './components/ScheduleRideModal';
import { reverseGeocode, type Place } from '../../lib/geocode';
import { fareForTrip } from './calculateFare';
import { createDemoNearbyDrivers, nudgeDemoCars, type DemoNearbyCar } from './demoNearbyDrivers';
import { useHomeStore } from './homeStore';
import { RideMap } from './map/RiderMap';
import { DEFAULT_CAMERA, type Camera } from './map/mapMath';
import { SearchOverlay } from './SearchOverlay';
import { TRIP_PHASE_LABEL, type HomePhase } from './types';
import { useRiderLocation } from './useRiderLocation';

const VEHICLE_META = {
  economy: { eta: 4, seats: 4 },
  comfort: { eta: 6, seats: 4 },
  moto: { eta: 3, seats: 1 },
} as const;

type TabSetter = (tab: 'safety' | 'messages' | 'account') => void;

export function HomeMapScreen({
  onOpenTab,
}: {
  onOpenTab?: TabSetter;
}) {
  const location = useRiderLocation();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [favoriteKey, setFavoriteKey] = useState<'home' | 'work' | null>(null);
  const [sheet, setSheet] = useState<'collapsed' | 'mid' | 'expanded'>('mid');
  const [cars, setCars] = useState<DemoNearbyCar[]>([]);
  const [followUser, setFollowUser] = useState(true);
  const [cameraRequest, setCameraRequest] = useState<Camera | null>(null);
  const [pickLabel, setPickLabel] = useState('Déplacez la carte pour choisir le lieu');
  const [resolving, setResolving] = useState(false);
  const pickCenter = useRef<{ lat: number; lng: number }>(DEFAULT_CAMERA);

  const phase = useHomeStore((s) => s.phase);
  const pickup = useHomeStore((s) => s.pickup);
  const dropoff = useHomeStore((s) => s.dropoff);
  const categoryId = useHomeStore((s) => s.categoryId);
  const fare = useHomeStore((s) => s.fare);
  const favorites = useHomeStore((s) => s.favorites);
  const { profile } = useAppAuth();
  const setTab = useShellStore((s) => s.setTab);
  const push = useShellStore((s) => s.push);
  const notifItems = useNotificationStore((s) => s.items);
  const unread = unreadCount(notifItems);
  const activeTrip = useHomeStore((s) => s.activeTrip);
  const setPickup = useHomeStore((s) => s.setPickup);
  const setPhase = useHomeStore((s) => s.setPhase);
  const setCategory = useHomeStore((s) => s.setCategory);
  const openSearch = useHomeStore((s) => s.openSearch);
  const openPickMap = useHomeStore((s) => s.openPickMap);
  const selectDestination = useHomeStore((s) => s.selectDestination);
  const requestRide = useHomeStore((s) => s.requestRide);
  const advanceTrip = useHomeStore((s) => s.advanceTrip);
  const cancelRide = useHomeStore((s) => s.cancelRide);
  const resetBooking = useHomeStore((s) => s.resetBooking);
  const saveFavorite = useHomeStore((s) => s.saveFavorite);
  const setOffline = useHomeStore((s) => s.setOffline);

  useEffect(() => {
    if (location.place) setPickup(location.place);
  }, [location.place, setPickup]);

  useEffect(() => {
    if (!isDevAuthBypass()) {
      setCars([]);
      return;
    }
    const origin = location.place ?? pickup;
    if (!origin) return;
    setCars(createDemoNearbyDrivers(origin));
  }, [location.place, pickup]);

  useEffect(() => {
    if (phase !== 'browse') return;
    const id = setInterval(() => setCars((prev) => nudgeDemoCars(prev)), 2800);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'vehicles' || phase === 'searching' || phase === 'assigned' || phase === 'completed') {
      setSheet('expanded');
    }
    if (phase === 'browse') setSheet('mid');
  }, [phase]);

  useEffect(() => {
    if (phase !== 'searching') return;
    const id = setTimeout(() => advanceTrip('assigned'), 3200);
    return () => clearTimeout(id);
  }, [phase, advanceTrip]);

  useEffect(() => {
    const sequence: Partial<Record<HomePhase, { next: HomePhase; ms: number }>> = {
      assigned: { next: 'en_route', ms: 3500 },
      en_route: { next: 'arrived', ms: 3200 },
      in_progress: { next: 'completed', ms: 5000 },
    };
    const step = sequence[phase];
    if (!step) return;
    const id = setTimeout(() => advanceTrip(step.next), step.ms);
    return () => clearTimeout(id);
  }, [phase, advanceTrip]);

  const recenter = useCallback(async () => {
    setFollowUser(true);
    const next = await location.locate(true);
    if (next) {
      setCameraRequest({ lat: next.lat, lng: next.lng, zoom: 14 });
      setTimeout(() => setCameraRequest(null), 400);
    } else {
      Alert.alert('Position', 'Autorisez la localisation pour recentrer la carte.');
    }
  }, [location]);

  const onCameraIdle = useCallback(
    (center: { lat: number; lng: number }) => {
      setFollowUser(false);
      pickCenter.current = center;
      if (phase !== 'pick-map') return;
      setResolving(true);
      const handle = setTimeout(() => {
        void reverseGeocode(center.lat, center.lng)
          .then((label) => setPickLabel(label ?? 'Lieu sélectionné à Kinshasa'))
          .catch(() => {
            setOffline(true);
            setPickLabel('Lieu sélectionné à Kinshasa');
          })
          .finally(() => setResolving(false));
      }, 420);
      return () => clearTimeout(handle);
    },
    [phase, setOffline],
  );

  const confirmPickedPlace = useCallback(() => {
    const place: Place = {
      lat: pickCenter.current.lat,
      lng: pickCenter.current.lng,
      label: pickLabel,
    };
    const target = useHomeStore.getState().pickTarget;
    if (target === 'pickup') {
      setPickup(place);
      setPhase(dropoff ? 'vehicles' : 'search');
      return;
    }
    selectDestination(place);
  }, [dropoff, pickLabel, selectDestination, setPhase, setPickup]);

  const selected = vehicleCategoryById(categoryId);
  const booking = phase === 'vehicles' || phase === 'confirm' || Boolean(activeTrip);
  const showSearch = phase === 'search';
  const pickMode = phase === 'pick-map';

  return (
    <View style={styles.root}>
      <RideMap
        pickup={pickup}
        dropoff={dropoff}
        user={location.place}
        accuracy={location.accuracy}
        cars={cars}
        showRoute={Boolean(dropoff && pickup && booking)}
        followUser={followUser}
        pickMode={pickMode}
        cameraRequest={cameraRequest}
        onCameraIdle={onCameraIdle}
        onCarPress={(car) => Alert.alert('Chauffeur proche', `Véhicule ${car.id.replace('demo-car-', '')} à proximité.`)}
      />

      <SafeAreaView pointerEvents="box-none" style={styles.safe} edges={['top']}>
        <HomeHeader
          photoUri={profile?.avatar_url}
          hasNotification={unread > 0}
          onPressProfile={() => setTab('account')}
          onPressNotifications={() => {
            useNotificationStore.getState().markAllRead();
            push({ id: 'notifications' });
          }}
        />
        {phase === 'browse' || phase === 'vehicles' || phase === 'confirm' ? (
          <DestinationSearchBar onPressSearch={openSearch} onPressSchedule={() => setScheduleOpen(true)} />
        ) : null}
        {location.status === 'denied' || location.status === 'error' ? (
          <Pressable onPress={() => void location.locate(true)} style={styles.gpsBanner}>
            <Text style={styles.gpsText}>
              {location.status === 'denied'
                ? 'Position refusée — appuyez pour autoriser'
                : 'Position indisponible — appuyez pour réessayer'}
            </Text>
          </Pressable>
        ) : null}
      </SafeAreaView>

      <View style={styles.locate}>
        <TnbIconButton accessibilityLabel="Ma position" onPress={() => void recenter()}>
          {location.busy ? <Text style={styles.loader}>…</Text> : <IconLocate />}
        </TnbIconButton>
      </View>

      {pickMode ? (
        <View style={styles.pickCard}>
          <Text style={styles.pickHint}>Déplacez la carte pour choisir le lieu</Text>
          <Text style={styles.pickAddr}>{resolving ? 'Recherche de l’adresse…' : pickLabel}</Text>
          <TnbButton label="Confirmer ce lieu" onPress={confirmPickedPlace} />
        </View>
      ) : null}

      {phase === 'browse' && !showSearch && !pickMode ? (
        <View style={styles.bottomDock}>
          <HomeBottomPanel
            homeLabel={favorites.home?.label ?? 'Ajouter'}
            workLabel={favorites.work?.label ?? 'Ajouter'}
            onHome={() => {
              if (favorites.home) selectDestination(favorites.home);
              else setFavoriteKey('home');
            }}
            onWork={() => {
              if (favorites.work) selectDestination(favorites.work);
              else setFavoriteKey('work');
            }}
            onAirport={() => {
              const airport = examplePlaces.find((place) => place.label.includes('N’djili'));
              if (airport) selectDestination(airport);
            }}
          />
        </View>
      ) : null}

      {!showSearch && !pickMode && phase !== 'browse' ? (
        <TnbBottomSheet snap={sheet} onSnapChange={setSheet}>

          {phase === 'vehicles' || phase === 'confirm' ? (
            <VehicleBody
              pickup={pickup}
              dropoff={dropoff}
              categoryId={categoryId}
              categoryLabel={selected.label}
              fareCents={fare?.totalCents ?? 0}
              onSelect={setCategory}
              onBook={() => {
                Alert.alert(
                  'Confirmer la course',
                  `${pickup?.label ?? 'Départ'} → ${dropoff?.label ?? 'Arrivée'}\n${selected.label} · ${formatFare(fare?.totalCents ?? 0)}`,
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Commander', onPress: () => requestRide() },
                  ],
                );
              }}
            />
          ) : null}

          {phase === 'searching' ? (
            <SearchingBody onCancel={cancelRide} />
          ) : null}

          {activeTrip?.driver &&
          (phase === 'assigned' || phase === 'en_route' || phase === 'arrived' || phase === 'in_progress') ? (
            <DriverBody
              phase={phase}
              onCall={() => void Linking.openURL(`tel:${activeTrip.driver?.phone}`)}
              onMessage={() => onOpenTab?.('messages')}
              onShare={() => Alert.alert('Partager', 'Lien de suivi fictif : taxinabiso://trip/demo')}
              onSafety={() => onOpenTab?.('safety')}
              onStart={() => advanceTrip('in_progress')}
            />
          ) : null}

          {phase === 'completed' ? (
            <CompletedBody
              fareCents={activeTrip?.fare.totalCents ?? fare?.totalCents ?? 0}
              onDone={resetBooking}
            />
          ) : null}
        </TnbBottomSheet>
      ) : null}

      {showSearch ? (
        <SearchOverlay onClose={() => setPhase(dropoff ? 'vehicles' : 'browse')} onPickMap={() => openPickMap('dropoff')} />
      ) : null}

      <ScheduleRideModal
        visible={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onConfirm={(when) => {
          setScheduleOpen(false);
          Alert.alert('Course planifiée', `Nous chercherons un chauffeur pour ${when}.`);
          openSearch();
        }}
      />
      <SavePlaceModal
        visible={favoriteKey !== null}
        title={favoriteKey === 'work' ? 'Adresse Travail' : 'Adresse Maison'}
        current={pickup}
        onClose={() => setFavoriteKey(null)}
        onSave={(place) => {
          if (favoriteKey) saveFavorite(favoriteKey, place);
          setFavoriteKey(null);
        }}
      />
    </View>
  );
}

function VehicleBody({
  pickup,
  dropoff,
  categoryId,
  categoryLabel,
  fareCents,
  onSelect,
  onBook,
}: {
  pickup: Place | null;
  dropoff: Place | null;
  categoryId: 'economy' | 'comfort' | 'moto';
  categoryLabel: string;
  fareCents: number;
  onSelect: (id: 'economy' | 'comfort' | 'moto') => void;
  onBook: () => void;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sheetTitle}>Choisissez votre course</Text>
      <Text style={styles.estimateHint}>Prix estimatif</Text>
      {vehicleCategories.map((category) => {
        const amount =
          pickup && dropoff ? fareForTrip(pickup, dropoff, category.id).totalCents : fareCents || 500000;
        return (
          <TnbVehicleCard
            key={category.id}
            category={category}
            etaMinutes={VEHICLE_META[category.id].eta}
            seats={VEHICLE_META[category.id].seats}
            fareCents={amount}
            selected={categoryId === category.id}
            onPress={() => onSelect(category.id)}
          />
        );
      })}
      <Text style={styles.payLine}>Espèces</Text>
      <Pressable onPress={() => Alert.alert('Paiement', 'Espèces uniquement pour le moment.')}>
        <Text style={styles.modify}>Modifier</Text>
      </Pressable>
      <Text style={styles.etaLine}>Arrivée estimée · {VEHICLE_META[categoryId].eta} min</Text>
      <View style={{ marginTop: 8, marginBottom: 12 }}>
        <TnbButton label={`Commander ${categoryLabel}`} onPress={onBook} disabled={!pickup || !dropoff} />
      </View>
    </ScrollView>
  );
}

function SearchingBody({ onCancel }: { onCancel: () => void }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 8 }}>
      <View style={styles.radar} />
      <Text style={styles.sheetTitle}>Recherche d’un chauffeur proche…</Text>
      <Text style={styles.estimateHint}>Estimation : 4 min</Text>
      <View style={{ alignSelf: 'stretch', marginTop: 16 }}>
        <TnbButton label="Annuler" variant="danger" onPress={onCancel} />
      </View>
    </View>
  );
}

function DriverBody({
  phase,
  onCall,
  onMessage,
  onShare,
  onSafety,
  onStart,
}: {
  phase: HomePhase;
  onCall: () => void;
  onMessage: () => void;
  onShare: () => void;
  onSafety: () => void;
  onStart: () => void;
}) {
  const driver = useHomeStore((s) => s.activeTrip?.driver);
  if (!driver) return null;
  return (
    <View>
      <TnbStatusPill label={TRIP_PHASE_LABEL[phase]} />
      <View style={{ height: 12 }} />
      <TnbDriverCard driver={driver} onCall={onCall} onMessage={onMessage} onShare={onShare} onSafety={onSafety} />
      {phase === 'arrived' ? (
        <View style={{ marginTop: 14 }}>
          <TnbButton label="Démarrer la course" onPress={onStart} />
        </View>
      ) : null}
    </View>
  );
}

function CompletedBody({ fareCents, onDone }: { fareCents: number; onDone: () => void }) {
  return (
    <View>
      <TnbStatusPill label="Arrivée à destination" />
      <Text style={[styles.sheetTitle, { marginTop: 12 }]}>Course terminée</Text>
      <Text style={styles.estimateHint}>Montant · {formatFare(fareCents)} · Espèces</Text>
      <View style={{ marginTop: 16 }}>
        <TnbButton label="Voir le reçu" onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8EEE6' },
  safe: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 10,
    maxWidth: '64%',
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: { color: colors.white, fontWeight: '800' },
  hello: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  name: { fontSize: 15, fontWeight: '800', color: colors.ink, maxWidth: 160 },
  headerActions: { flexDirection: 'row', gap: 8 },
  badge: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
  gpsBanner: {
    marginTop: 10,
    backgroundColor: 'rgba(17,24,39,0.86)',
    borderRadius: 14,
    padding: 10,
  },
  gpsText: { color: colors.white, textAlign: 'center', fontWeight: '600', fontSize: 13 },
  locate: { position: 'absolute', right: 16, bottom: 252 },
  bottomDock: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  loader: { color: colors.brand, fontWeight: '800' },
  pickCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 110,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    shadowColor: '#111827',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  pickHint: { textAlign: 'center', color: colors.textMuted, fontWeight: '600' },
  pickAddr: { textAlign: 'center', fontSize: 16, fontWeight: '800', color: colors.ink, marginVertical: 10 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: colors.ink, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  section: { marginTop: 8, marginBottom: 6, color: colors.textMuted, fontWeight: '700' },
  popular: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  popularText: { fontSize: 15, color: colors.ink, fontWeight: '600' },
  estimateHint: { color: colors.textMuted, marginBottom: 10, fontWeight: '600' },
  payLine: { fontSize: 16, fontWeight: '800', color: colors.ink },
  modify: { color: colors.brand, fontWeight: '700', marginTop: 4, marginBottom: 8 },
  etaLine: { color: colors.textMuted, marginBottom: 6 },
  route: { fontSize: 14, color: colors.ink, fontWeight: '600', marginBottom: 8 },
  radar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: 'rgba(240,74,24,0.35)',
    backgroundColor: 'rgba(240,74,24,0.12)',
    marginBottom: 12,
  },
});
