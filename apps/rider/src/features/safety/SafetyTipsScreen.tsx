import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OverlayHeader } from '../../components/tnb/OverlayHeader';
import { ScreenEnter } from '../../components/tnb/ScreenEnter';
import { colors } from '../../config/brand';

const TIPS = [
  'Vérifiez le nom, la photo et la plaque avant de monter.',
  'Partagez votre trajet avec un contact de confiance.',
  'Asseyez-vous à l’arrière si vous voyagez seul la nuit.',
  'Gardez votre téléphone chargé pendant la course.',
  'En cas de doute, annulez et contactez l’assistance.',
];

export function SafetyTipsScreen({ onBack }: { onBack: () => void }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenEnter>
        <OverlayHeader title="Conseils de sécurité" subtitle="Quelques gestes simples" onBack={onBack} />
        <ScrollView contentContainerStyle={styles.content}>
          {TIPS.map((tip) => (
            <View key={tip} style={styles.card}>
              <Text style={styles.tip}>{tip}</Text>
            </View>
          ))}
        </ScrollView>
      </ScreenEnter>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tip: { fontSize: 15, lineHeight: 22, color: colors.ink, fontWeight: '600' },
});
