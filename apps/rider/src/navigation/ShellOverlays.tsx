import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OverlayHeader } from '../components/tnb/OverlayHeader';
import { ScreenEnter } from '../components/tnb/ScreenEnter';
import { TnbButton } from '../components/tnb/TnbButton';
import { TnbDriverCard } from '../components/tnb/TnbDriverCard';
import { brand, colors } from '../config/brand';
import { useAppAuth } from '../features/auth/AuthProvider';
import { signOutApp } from '../features/auth/authService';
import { ConversationScreen } from '../features/messages/ConversationScreen';
import { NotificationCenter } from '../features/notifications/NotificationCenter';
import { useActivityStore } from '../features/activity/activityStore';
import { TripDetailScreen } from '../features/activity/TripDetailScreen';
import { ReportProblemScreen } from '../features/safety/ReportProblemScreen';
import { SafetyTipsScreen } from '../features/safety/SafetyTipsScreen';
import { TrustedContactsScreen } from '../features/safety/TrustedContactsScreen';
import { EditAvatarScreen } from '../features/account/EditAvatarScreen';
import { useHomeStore } from '../features/home/homeStore';
import type { ShellScreen } from './shellStore';
import { useShellStore } from './shellStore';

export function ShellOverlay() {
  const stack = useShellStore((s) => s.stack);
  const pop = useShellStore((s) => s.pop);
  const current = stack[stack.length - 1];
  if (!current) return null;
  return <OverlayBody screen={current} onBack={pop} />;
}

function OverlayBody({ screen, onBack }: { screen: ShellScreen; onBack: () => void }) {
  const rides = useActivityStore((s) => s.rides);
  const driver = useHomeStore((s) => s.activeTrip?.driver);

  if (screen.id === 'notifications') return <NotificationCenter onBack={onBack} />;
  if (screen.id === 'conversation') return <ConversationScreen conversationId={screen.conversationId} onBack={onBack} />;
  if (screen.id === 'trustedContacts') return <TrustedContactsScreen onBack={onBack} />;
  if (screen.id === 'safetyTips') return <SafetyTipsScreen onBack={onBack} />;
  if (screen.id === 'tripDetail') {
    const ride = rides.find((item) => item.id === screen.tripId);
    if (!ride) return <InfoScreen title="Course" body="Cette course est introuvable." onBack={onBack} />;
    return <TripDetailScreen ride={ride} onBack={onBack} />;
  }
  if (screen.id === 'report') return <ReportProblemScreen onBack={onBack} />;
  if (screen.id === 'verifyDriver') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenEnter>
          <OverlayHeader title="Vérifier mon chauffeur" onBack={onBack} />
          <View style={styles.pad}>
            {driver ? (
              <TnbDriverCard
                driver={driver}
                onCall={() => undefined}
                onMessage={() => undefined}
                onShare={() => undefined}
                onSafety={() => undefined}
              />
            ) : (
              <Text style={styles.body}>Aucun chauffeur n’est assigné pour le moment.</Text>
            )}
          </View>
        </ScreenEnter>
      </SafeAreaView>
    );
  }
  if (screen.id === 'deleteAccount') return <DeleteAccountScreen onBack={onBack} />;
  if (screen.id === 'editProfile') return <EditAvatarScreen onBack={onBack} />;

  const copy = infoCopy(screen);
  return <InfoScreen title={copy.title} body={copy.body} onBack={onBack} />;
}

function infoCopy(screen: ShellScreen): { title: string; body: string } {
  switch (screen.id) {
    case 'savedPlaces':
      return { title: 'Adresses enregistrées', body: 'Maison, Travail et Aéroport se définissent depuis l’accueil.' };
    case 'scheduledRides':
      return { title: 'Courses programmées', body: 'Les courses planifiées depuis l’accueil apparaîtront ici.' };
    case 'payments':
      return { title: 'Moyens de paiement', body: 'Le paiement se fait actuellement en espèces.' };
    case 'help':
      return {
        title: 'Aide et assistance',
        body: `Contactez ${brand.supportEmail} pour toute question. L’assistance téléphonique sera ajoutée dès qu’un numéro sera configuré.`,
      };
    case 'about':
      return {
        title: 'À propos de Taxi Na Biso',
        body: `${brand.tagline}. Service de mobilité à Kinshasa.`,
      };
    case 'editProfile':
      return { title: 'Profil', body: '' };
    case 'language':
      return { title: 'Langue', body: 'L’application est actuellement en français.' };
    case 'appearance':
      return { title: 'Apparence', body: 'Le thème clair Taxi Na Biso est actif.' };
    case 'permissions':
      return { title: 'Autorisations', body: 'La localisation est demandée pour afficher votre position sur la carte.' };
    case 'legal':
      return {
        title: screen.kind === 'terms' ? 'Conditions d’utilisation' : 'Politique de confidentialité',
        body: screen.kind === 'terms'
          ? 'Les conditions détaillées seront publiées à l’adresse officielle Taxi Na Biso.'
          : 'La politique de confidentialité sera publiée à l’adresse officielle Taxi Na Biso.',
      };
    default:
      return { title: 'Taxi Na Biso', body: '' };
  }
}

function InfoScreen({ title, body, onBack }: { title: string; body: string; onBack: () => void }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenEnter>
        <OverlayHeader title={title} onBack={onBack} />
        <ScrollView contentContainerStyle={styles.pad}>
          <Text style={styles.body}>{body}</Text>
        </ScrollView>
      </ScreenEnter>
    </SafeAreaView>
  );
}

function DeleteAccountScreen({ onBack }: { onBack: () => void }) {
  const { state } = useAppAuth();
  const [step, setStep] = useState(1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenEnter>
        <OverlayHeader title="Supprimer mon compte" onBack={onBack} />
        <View style={styles.pad}>
          {step === 1 ? (
            <>
              <Text style={styles.body}>Cette action est définitive. Vos courses passées pourront être conservées pour des raisons légales.</Text>
              <TnbButton label="Continuer" variant="danger" onPress={() => setStep(2)} />
            </>
          ) : null}
          {step === 2 ? (
            <>
              <Text style={styles.body}>Confirmez que vous souhaitez demander la suppression de ce compte.</Text>
              <TnbButton label="Je confirme" variant="danger" onPress={() => setStep(3)} />
            </>
          ) : null}
          {step === 3 ? (
            <>
              <Text style={styles.body}>
                La suppression n’est pas exécutée depuis l’application avec une clé d’administration. Une demande sera transmise au support, puis la session sera fermée.
              </Text>
              <TnbButton
                label="Envoyer la demande et se déconnecter"
                variant="danger"
                onPress={() => {
                  Alert.alert(
                    'Demande enregistrée',
                    'Contactez le support pour finaliser la suppression. Vous allez être déconnecté.',
                    [
                      {
                        text: 'OK',
                        onPress: () => void signOutApp(state.status === 'authenticated' ? state.source : null),
                      },
                    ],
                  );
                }}
              />
            </>
          ) : null}
          <View style={{ height: 12 }} />
          <Pressable onPress={onBack} accessibilityLabel="Annuler">
            <Text style={styles.cancel}>Annuler</Text>
          </Pressable>
        </View>
      </ScreenEnter>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  pad: { padding: 16 },
  body: { fontSize: 15, lineHeight: 22, color: colors.textMuted, marginBottom: 16, fontWeight: '600' },
  cancel: { textAlign: 'center', color: colors.ink, fontWeight: '700', minHeight: 44 },
});
