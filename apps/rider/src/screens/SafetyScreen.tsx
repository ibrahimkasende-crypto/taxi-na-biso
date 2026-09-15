import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenEnter } from '../components/tnb/ScreenEnter';
import { IconShield } from '../components/tnb/TnbIcons';
import { brand, colors } from '../config/brand';
import { useHomeStore } from '../features/home/homeStore';
import { useShellStore } from '../navigation/shellStore';

export function SafetyScreen() {
  const driver = useHomeStore((s) => s.activeTrip?.driver);
  const trip = useHomeStore((s) => s.activeTrip);
  const push = useShellStore((s) => s.push);

  async function shareTrip(): Promise<void> {
    const details = trip
      ? `Course Taxi Na Biso : ${trip.pickup.label} → ${trip.dropoff.label}`
      : 'Je voyage avec Taxi Na Biso.';
    await Share.share({ message: `${details}\n${brand.scheme}://trip/${trip?.id ?? 'none'}` });
  }

  function callEmergency(): void {
    Alert.alert('Urgence', `Appeler le ${brand.emergencyPhone} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Appeler', style: 'destructive', onPress: () => void Linking.openURL(`tel:${brand.emergencyPhone}`) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenEnter>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <View style={styles.shieldWrap}>
              <IconShield color={colors.brand} size={28} />
            </View>
            <Text style={styles.title}>Votre sécurité</Text>
            <Text style={styles.sub}>Nous veillons sur vous à chaque trajet</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Centre de sécurité</Text>
            <Text style={styles.cardText}>Accédez rapidement aux outils essentiels pendant votre course.</Text>

            <Pressable style={styles.sos} onPress={callEmergency} accessibilityLabel="Urgence">
              <Text style={styles.sosText}>Urgence</Text>
            </Pressable>

            <Action label="Partager mon trajet" onPress={() => void shareTrip()} />
            <Action label="Contacts de confiance" onPress={() => push({ id: 'trustedContacts' })} />
            <Action label="Signaler un problème" onPress={() => push({ id: 'report' })} />
            <Action label="Vérifier mon chauffeur" onPress={() => push({ id: 'verifyDriver' })} />
            <Action label="Conseils de sécurité" onPress={() => push({ id: 'safetyTips' })} />
          </View>

          {driver ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Chauffeur actuel</Text>
              <Text style={styles.value}>{driver.displayName}</Text>
              <Text style={styles.meta}>
                {driver.vehicle} · {driver.plate}
              </Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Assistance Taxi Na Biso</Text>
            {brand.supportPhone ? (
              <Action label="Appel" onPress={() => void Linking.openURL(`tel:${brand.supportPhone}`)} />
            ) : (
              <Action
                label="Appel"
                onPress={() => Alert.alert('Assistance', 'Le numéro d’assistance n’est pas encore configuré.')}
              />
            )}
            {brand.whatsappSupport ? (
              <Action label="WhatsApp" onPress={() => void Linking.openURL(brand.whatsappSupport)} />
            ) : null}
            <Action label="Centre d’aide" onPress={() => push({ id: 'help' })} />
          </View>
        </ScrollView>
      </ScreenEnter>
    </SafeAreaView>
  );
}

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && { opacity: 0.8 }]} accessibilityLabel={label}>
      <Text style={styles.actionText}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  hero: {
    backgroundColor: '#FFE8DF',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  shieldWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink },
  sub: { marginTop: 6, color: colors.textMuted, fontWeight: '600' },
  card: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  cardText: { marginTop: 6, marginBottom: 12, color: colors.textMuted, lineHeight: 20 },
  sos: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sosText: { color: colors.white, fontWeight: '800', fontSize: 16 },
  action: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionText: { fontWeight: '700', color: colors.ink, fontSize: 15 },
  chevron: { fontSize: 22, color: '#9CA3AF' },
  value: { marginTop: 6, fontWeight: '800', color: colors.ink, fontSize: 16 },
  meta: { marginTop: 4, color: colors.textMuted },
});
