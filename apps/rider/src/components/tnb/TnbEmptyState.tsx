import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../config/brand';

export function TnbEmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.orb} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24 },
  orb: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFE4D6', marginBottom: 14 },
  title: { fontSize: 17, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  sub: { marginTop: 6, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
