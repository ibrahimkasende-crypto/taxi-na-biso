import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OverlayHeader } from '../../components/tnb/OverlayHeader';
import { ScreenEnter } from '../../components/tnb/ScreenEnter';
import { TnbButton } from '../../components/tnb/TnbButton';
import { TnbEmptyState } from '../../components/tnb/TnbEmptyState';
import { colors } from '../../config/brand';
import { toE164 } from '../../config/brand';
import { readTrustedContacts, writeTrustedContacts, type TrustedContact } from './trustedContacts';

export function TrustedContactsScreen({ onBack }: { onBack: () => void }) {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    void readTrustedContacts().then(setContacts);
  }, []);

  async function persist(next: TrustedContact[]): Promise<void> {
    setContacts(next);
    await writeTrustedContacts(next);
  }

  function save(): void {
    const trimmed = name.trim();
    if (!trimmed || phone.trim().length < 8) {
      Alert.alert('Contact incomplet', 'Indiquez un nom et un numéro valides.');
      return;
    }
    const row: TrustedContact = {
      id: editingId ?? `tc-${Date.now()}`,
      name: trimmed,
      phone: toE164(phone),
    };
    const next = editingId ? contacts.map((item) => (item.id === editingId ? row : item)) : [...contacts, row];
    void persist(next);
    setName('');
    setPhone('');
    setEditingId(null);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenEnter>
        <OverlayHeader title="Contacts de confiance" subtitle="Prévenez un proche en un geste" onBack={onBack} />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nom"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            accessibilityLabel="Nom du contact"
          />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Téléphone"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            style={styles.input}
            accessibilityLabel="Téléphone du contact"
          />
          <TnbButton label={editingId ? 'Enregistrer' : 'Ajouter'} onPress={save} />

          {contacts.length === 0 ? (
            <TnbEmptyState title="Aucun contact" subtitle="Ajoutez une personne de confiance." />
          ) : (
            contacts.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.phone}>{item.phone}</Text>
                </View>
                <Pressable
                  onPress={() => {
                    setEditingId(item.id);
                    setName(item.name);
                    setPhone(item.phone);
                  }}
                  accessibilityLabel="Modifier"
                >
                  <Text style={styles.link}>Modifier</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    Alert.alert('Supprimer', `Retirer ${item.name} ?`, [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Supprimer',
                        style: 'destructive',
                        onPress: () => void persist(contacts.filter((row) => row.id !== item.id)),
                      },
                    ])
                  }
                  accessibilityLabel="Supprimer"
                >
                  <Text style={styles.danger}>Supprimer</Text>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      </ScreenEnter>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  input: {
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#EEF0F3',
    paddingHorizontal: 14,
    color: colors.ink,
    marginBottom: 10,
  },
  card: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  name: { fontWeight: '800', color: colors.ink },
  phone: { color: colors.textMuted, marginTop: 2 },
  link: { color: colors.brand, fontWeight: '700' },
  danger: { color: colors.danger, fontWeight: '700' },
});
