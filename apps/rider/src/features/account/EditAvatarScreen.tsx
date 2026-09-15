import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OverlayHeader } from '../../components/tnb/OverlayHeader';
import { ProfileAvatar } from '../../components/tnb/ProfileAvatar';
import { ScreenEnter } from '../../components/tnb/ScreenEnter';
import { TnbButton } from '../../components/tnb/TnbButton';
import { LOCAL_DEFAULT_AVATAR } from '../../config/assets';
import { colors } from '../../config/brand';
import { useAppAuth } from '../auth/AuthProvider';
import { readDemoSession, writeDemoSession } from '../auth/demo/demoSession';
import { pickImageFromGallery, uploadOwnAvatar } from './avatarService';

export function EditAvatarScreen({ onBack }: { onBack: () => void }) {
  const { state, profile, refreshProfile } = useAppAuth();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(profile?.avatar_url ?? null);
  const demo = state.status === 'authenticated' && state.source === 'demo-local';

  async function changePhoto(): Promise<void> {
    setBusy(true);
    try {
      const picked = await pickImageFromGallery();
      if (!picked) {
        setBusy(false);
        return;
      }
      setPreview(picked.uri);
      if (state.status !== 'authenticated' || state.source !== 'supabase') {
        Alert.alert(
          'Galerie',
          'La photo choisie s’affiche ici. L’envoi Storage n’est disponible que sur un compte Supabase connecté.',
        );
        return;
      }
      const url = await uploadOwnAvatar(state.session.user.id, picked.uri, picked.mime);
      setPreview(url);
      await refreshProfile();
      Alert.alert('Photo mise à jour', 'Votre avatar a été enregistré.');
    } catch (error) {
      Alert.alert('Envoi impossible', (error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function setDemoKey(avatarKey: 'ikas' | 'default'): Promise<void> {
    const session = await readDemoSession();
    if (!session) return;
    await writeDemoSession({ ...session, avatarKey });
    setPreview(avatarKey === 'default' ? LOCAL_DEFAULT_AVATAR : null);
    await refreshProfile();
    Alert.alert('Photo enregistrée', avatarKey === 'ikas' ? 'Photo Ikas affichée.' : 'Photo locale de secours affichée.');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenEnter>
        <OverlayHeader title="Photo de profil" subtitle="JPEG, PNG ou WebP · 5 Mo max" onBack={onBack} />
        <View style={styles.body}>
          <ProfileAvatar uri={preview} size={120} discreet />
          <View style={{ height: 20 }} />
          <TnbButton label={busy ? 'Envoi…' : 'Choisir une photo'} loading={busy} onPress={() => void changePhoto()} />
          {demo ? (
            <>
              <View style={{ height: 12 }} />
              <TnbButton label="Utiliser la photo Ikas" variant="ghost" onPress={() => void setDemoKey('ikas')} />
              <View style={{ height: 12 }} />
              <TnbButton
                label="Utiliser une autre photo locale"
                variant="ghost"
                onPress={() => void setDemoKey('default')}
              />
            </>
          ) : null}
          <Pressable onPress={onBack} style={styles.cancel} accessibilityLabel="Fermer">
            <Text style={styles.cancelText}>Fermer</Text>
          </Pressable>
        </View>
      </ScreenEnter>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { alignItems: 'center', padding: 24 },
  cancel: { marginTop: 16, minHeight: 44, justifyContent: 'center' },
  cancelText: { color: colors.ink, fontWeight: '700' },
});
