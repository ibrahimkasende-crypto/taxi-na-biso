import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileAvatar } from '../components/tnb/ProfileAvatar';
import { ScreenEnter } from '../components/tnb/ScreenEnter';
import { colors } from '../config/brand';
import { signOutApp } from '../features/auth/authService';
import { isDevAuthBypass } from '../features/auth/demo/demoAuthEnabled';
import { useAppAuth } from '../features/auth/AuthProvider';
import { useShellStore } from '../navigation/shellStore';

type Row = { label: string; onPress: () => void };

export function AccountScreen({ displayName, phone }: { displayName?: string | null; phone?: string | null }) {
  const { state, profile } = useAppAuth();
  const setTab = useShellStore((s) => s.setTab);
  const push = useShellStore((s) => s.push);

  const demo = isDevAuthBypass() && state.status === 'authenticated' && state.source === 'demo-local';
  const name = demo ? 'Ibrahim Kasende' : displayName?.trim() || profile?.display_name?.trim() || 'Client Taxi Na Biso';
  const shownPhone = phone?.trim() || profile?.phone?.trim() || (demo ? '+243 810 000 001' : 'Numéro local');
  const verified = state.status === 'authenticated' && state.source === 'supabase';
  const version = Constants.expoConfig?.version ?? '0.0.1';

  const travel: Row[] = [
    { label: 'Mes activités', onPress: () => setTab('activity') },
    { label: 'Adresses enregistrées', onPress: () => push({ id: 'savedPlaces' }) },
    { label: 'Courses programmées', onPress: () => push({ id: 'scheduledRides' }) },
    { label: 'Moyens de paiement', onPress: () => push({ id: 'payments' }) },
  ];
  const prefs: Row[] = [
    { label: 'Notifications', onPress: () => push({ id: 'notifications' }) },
    { label: 'Langue', onPress: () => push({ id: 'language' }) },
    { label: 'Apparence', onPress: () => push({ id: 'appearance' }) },
    { label: 'Autorisations', onPress: () => push({ id: 'permissions' }) },
  ];
  const safety: Row[] = [
    { label: 'Centre de sécurité', onPress: () => setTab('safety') },
    { label: 'Contacts de confiance', onPress: () => push({ id: 'trustedContacts' }) },
    { label: 'Aide et assistance', onPress: () => push({ id: 'help' }) },
    { label: 'Signaler un problème', onPress: () => push({ id: 'report' }) },
  ];
  const about: Row[] = [
    { label: 'Conditions d’utilisation', onPress: () => push({ id: 'legal', kind: 'terms' }) },
    { label: 'Politique de confidentialité', onPress: () => push({ id: 'legal', kind: 'privacy' }) },
    { label: 'À propos de Taxi Na Biso', onPress: () => push({ id: 'about' }) },
    { label: `Version de l’application`, onPress: () => Alert.alert('Version', version) },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenEnter>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <View style={styles.avatarBlock}>
              <ProfileAvatar
                uri={profile?.avatar_url}
                size={84}
                discreet
                onPress={() => push({ id: 'editProfile' })}
                accessibilityLabel="Modifier le profil"
              />
              <Pressable
                style={styles.pencil}
                onPress={() => push({ id: 'editProfile' })}
                accessibilityLabel="Changer la photo"
              >
                <Text style={styles.pencilTxt}>✎</Text>
              </Pressable>
            </View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.phone}>{shownPhone}</Text>
            {profile?.email ? <Text style={styles.phone}>{profile.email}</Text> : null}
            {verified ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Compte vérifié</Text>
              </View>
            ) : null}
            <Pressable style={styles.edit} onPress={() => push({ id: 'editProfile' })} accessibilityLabel="Modifier le profil">
              <Text style={styles.editText}>Modifier le profil</Text>
            </Pressable>
          </View>

          <Section title="Mes déplacements" rows={travel} />
          <Section title="Préférences" rows={prefs} />
          <Section title="Sécurité et assistance" rows={safety} />
          <Section title="À propos" rows={about} />

          <Pressable
            style={styles.logout}
            onPress={() =>
              Alert.alert('Se déconnecter', 'Fermer la session sur cet appareil ?', [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Se déconnecter',
                  style: 'destructive',
                  onPress: () => void signOutApp(state.status === 'authenticated' ? state.source : null),
                },
              ])
            }
            accessibilityLabel="Se déconnecter"
          >
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </Pressable>

          <Pressable style={styles.delete} onPress={() => push({ id: 'deleteAccount' })} accessibilityLabel="Supprimer mon compte">
            <Text style={styles.deleteText}>Supprimer mon compte</Text>
          </Pressable>
        </ScrollView>
      </ScreenEnter>
    </SafeAreaView>
  );
}

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.group}>
        {rows.map((row) => (
          <Pressable key={row.label} onPress={row.onPress} style={styles.row} accessibilityLabel={row.label}>
            <Text style={styles.rowText}>{row.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  hero: {
    backgroundColor: '#FFE8DF',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
    marginBottom: 8,
  },
  avatarBlock: { position: 'relative' },
  pencil: {
    position: 'absolute',
    right: -2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brand,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pencilTxt: { color: colors.white, fontSize: 13, fontWeight: '800' },
  name: { marginTop: 10, fontSize: 22, fontWeight: '800', color: colors.ink },
  phone: { marginTop: 4, color: colors.textMuted, fontWeight: '600' },
  badge: {
    marginTop: 8,
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: colors.success, fontWeight: '800', fontSize: 12 },
  edit: { marginTop: 12, minHeight: 44, justifyContent: 'center' },
  editText: { color: colors.brand, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginTop: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.textMuted, marginBottom: 8 },
  group: { backgroundColor: colors.white, borderRadius: 18, overflow: 'hidden' },
  row: {
    minHeight: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowText: { fontWeight: '700', color: colors.ink, flex: 1, paddingRight: 8 },
  chevron: { fontSize: 22, color: '#9CA3AF' },
  logout: {
    marginHorizontal: 16,
    marginTop: 24,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: colors.danger, fontWeight: '800' },
  delete: { marginTop: 14, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  deleteText: { color: '#9CA3AF', fontWeight: '600', fontSize: 13 },
});
