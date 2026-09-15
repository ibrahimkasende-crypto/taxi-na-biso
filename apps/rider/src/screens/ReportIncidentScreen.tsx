import { spacing, typography } from '@openride/ui';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radii } from '../config/brand';
import { useAppAuth } from '../features/auth/AuthProvider';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  { key: 'safety', label: 'Sécurité' },
  { key: 'vehicle_damage', label: 'Véhicule' },
  { key: 'abuse', label: 'Incivilité' },
  { key: 'payment_dispute', label: 'Paiement' },
  { key: 'medical', label: 'Médical' },
  { key: 'other', label: 'Autre' },
] as const;

const HIGH = new Set(['safety', 'medical', 'abuse']);

export function ReportIncidentScreen() {
  const navigation = useNavigation();
  const { state } = useAppAuth();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['key']>('safety');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(): Promise<void> {
    setBusy(true);
    try {
      if (state.status === 'authenticated' && state.source === 'demo-local') {
        Alert.alert('Envoi impossible', 'Le signalement n’est pas disponible pour le moment.');
        return;
      }
      const { data: u } = await supabase.auth.getUser();
      const id = u.user?.id;
      if (!id) throw new Error('Vous n’êtes pas connecté');
      const { error } = await supabase.from('incident_reports').insert({
        reported_by: id,
        rider_id: id,
        category,
        severity: HIGH.has(category) ? 'high' : 'low',
        description: description.trim(),
      });
      if (error) throw error;
      Alert.alert('Merci', 'Votre signalement a été envoyé.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Envoi impossible', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Que s’est-il passé ?</Text>
      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.key}
            style={[styles.chip, category === c.key && styles.chipActive]}
            onPress={() => setCategory(c.key)}
          >
            <Text style={category === c.key ? styles.chipTextActive : styles.chipText}>{c.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Décrivez les faits</Text>
      <TextInput
        style={styles.input}
        placeholder="Expliquez ce qui s’est passé…"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      <Pressable
        style={[styles.button, (busy || description.trim().length < 5) && styles.disabled]}
        onPress={submit}
        disabled={busy || description.trim().length < 5}
      >
        <Text style={styles.buttonText}>{busy ? 'Envoi…' : 'Envoyer le signalement'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, backgroundColor: colors.background },
  label: {
    fontSize: typography.size.sm,
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { color: colors.text },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: typography.size.md,
    minHeight: 120,
    backgroundColor: colors.surface,
    color: colors.ink,
  },
  button: {
    backgroundColor: colors.brand,
    padding: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  disabled: { opacity: 0.5 },
  buttonText: { color: colors.white, fontWeight: '600', fontSize: typography.size.lg },
});
