import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OverlayHeader } from '../../components/tnb/OverlayHeader';
import { TnbButton } from '../../components/tnb/TnbButton';
import { colors } from '../../config/brand';
import { useAppAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';

const CATEGORIES = [
  { key: 'safety', label: 'Sécurité' },
  { key: 'vehicle_damage', label: 'Véhicule' },
  { key: 'abuse', label: 'Incivilité' },
  { key: 'payment_dispute', label: 'Paiement' },
  { key: 'medical', label: 'Médical' },
  { key: 'other', label: 'Autre' },
] as const;

const HIGH = new Set(['safety', 'medical', 'abuse']);

export function ReportProblemScreen({ onBack }: { onBack: () => void }) {
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
      onBack();
    } catch (e) {
      Alert.alert('Envoi impossible', (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <OverlayHeader title="Signaler un problème" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Catégorie</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setCategory(item.key)}
              style={[styles.chip, category === item.key && styles.chipOn]}
            >
              <Text style={category === item.key ? styles.chipOnText : styles.chipText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Expliquez ce qui s’est passé…"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />
        <TnbButton
          label={busy ? 'Envoi…' : 'Envoyer'}
          loading={busy}
          disabled={description.trim().length < 5}
          onPress={() => void submit()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontWeight: '700', color: colors.textMuted, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { color: colors.ink, fontWeight: '600' },
  chipOnText: { color: colors.white, fontWeight: '700' },
  input: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 12,
    color: colors.ink,
    marginBottom: 16,
  },
});
