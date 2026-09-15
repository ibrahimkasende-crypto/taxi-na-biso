import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TnbButton } from '../../components/tnb/TnbButton';
import { TnbEmptyState } from '../../components/tnb/TnbEmptyState';
import { IconBack, IconPin } from '../../components/tnb/TnbIcons';
import { colors, examplePlaces } from '../../config/brand';
import { searchPlaces, type Place } from '../../lib/geocode';
import { useHomeStore } from './homeStore';

type Props = {
  onClose: () => void;
  onPickMap: () => void;
};

export function SearchOverlay({ onClose, onPickMap }: Props) {
  const pickup = useHomeStore((s) => s.pickup);
  const dropoff = useHomeStore((s) => s.dropoff);
  const recentPlaces = useHomeStore((s) => s.recentPlaces);
  const offline = useHomeStore((s) => s.offline);
  const selectDestination = useHomeStore((s) => s.selectDestination);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([...examplePlaces]);
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    const id = ++seq.current;
    const handle = setTimeout(() => {
      setLoading(true);
      void searchPlaces(query, pickup ?? undefined)
        .then((places) => {
          if (id !== seq.current) return;
          setResults(places.length ? places : query.trim() ? [] : [...examplePlaces]);
        })
        .catch(() => {
          if (id === seq.current) setResults([...examplePlaces]);
        })
        .finally(() => {
          if (id === seq.current) setLoading(false);
        });
    }, 280);
    return () => clearTimeout(handle);
  }, [query, pickup]);

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.back} accessibilityLabel="Retour">
              <IconBack />
            </Pressable>
            <Text style={styles.title}>Votre trajet</Text>
          </View>

          <View style={styles.fields}>
            <View style={styles.field}>
              <View style={styles.dotPick} />
              <Text style={styles.fieldText} numberOfLines={1}>
                {pickup?.label ?? 'Position actuelle'}
              </Text>
            </View>
            <View style={styles.field}>
              <View style={styles.dotDrop} />
              <TextInput
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder="Où allez-vous ?"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>
          </View>

          <Pressable onPress={onPickMap} style={styles.mapPick}>
            <IconPin />
            <Text style={styles.mapPickText}>Sélectionner sur la carte</Text>
          </Pressable>

          {offline ? <Text style={styles.offline}>Hors connexion — lieux de Kinshasa proposés.</Text> : null}

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list}>
            {loading ? <ActivityIndicator color={colors.brand} style={{ marginVertical: 16 }} /> : null}
            {!loading && results.length === 0 ? (
              <TnbEmptyState title="Aucun lieu trouvé" subtitle="Essayez Gombe, Limete ou UNIKIN." />
            ) : null}
            {!query.trim() ? (
              <>
                <Text style={styles.section}>Récents</Text>
                {recentPlaces.slice(0, 4).map((place) => (
                  <PlaceRow key={`r-${place.label}`} place={place} onPress={() => selectDestination(place)} />
                ))}
                <Text style={styles.section}>Populaires à Kinshasa</Text>
              </>
            ) : null}
            {results.map((place) => (
              <PlaceRow key={place.label} place={place} onPress={() => selectDestination(place)} />
            ))}
            {dropoff ? (
              <View style={{ marginTop: 12 }}>
                <TnbButton label="Continuer" onPress={() => selectDestination(dropoff)} />
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function PlaceRow({ place, onPress }: { place: Place; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowDot} />
      <Text style={styles.rowText} numberOfLines={2}>
        {place.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: colors.white, zIndex: 20 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: colors.ink, marginRight: 44 },
  fields: { marginHorizontal: 16, backgroundColor: '#F7F7F5', borderRadius: 18, padding: 12 },
  field: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  dotPick: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#111827', marginRight: 10 },
  dotDrop: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand, marginRight: 10 },
  fieldText: { flex: 1, fontSize: 15, color: colors.ink, fontWeight: '600' },
  input: { flex: 1, fontSize: 16, color: colors.ink, paddingVertical: 8 },
  mapPick: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  mapPickText: { marginLeft: 8, color: colors.brand, fontWeight: '700' },
  offline: { paddingHorizontal: 20, color: colors.textMuted, fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  section: { marginTop: 16, marginBottom: 8, fontSize: 13, fontWeight: '700', color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand, marginRight: 12 },
  rowText: { flex: 1, fontSize: 15, color: colors.ink },
});
