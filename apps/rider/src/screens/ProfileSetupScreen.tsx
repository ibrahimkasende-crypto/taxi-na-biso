import { spacing, typography } from '@openride/ui';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { brand, colors, radii } from '../config/brand';
import { completeProfile } from '../lib/auth';

export function ProfileSetupScreen({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSave(): Promise<void> {
    setBusy(true);
    try {
      await completeProfile(name, email);
      onDone();
    } catch (e) {
      Alert.alert('Profil non enregistré', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur {brand.appName}</Text>
      <Text style={styles.subtitle}>
        Indiquez votre prénom pour que le chauffeur sache qui récupérer.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Prénom"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
        editable={!busy}
        autoFocus
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail (facultatif)"
        placeholderTextColor={colors.textMuted}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        editable={!busy}
      />
      <Pressable
        style={[styles.button, (busy || name.trim().length < 1) && styles.disabled]}
        onPress={onSave}
        disabled={busy || name.trim().length < 1}
      >
        <Text style={styles.buttonText}>{busy ? 'Enregistrement…' : 'Continuer'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.size.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    color: colors.ink,
  },
  button: {
    backgroundColor: colors.brand,
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  buttonText: { color: colors.white, fontWeight: '600', fontSize: typography.size.md },
});
