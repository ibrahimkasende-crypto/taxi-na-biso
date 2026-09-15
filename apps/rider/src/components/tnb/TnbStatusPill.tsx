import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../config/brand';

export function TnbStatusPill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <View style={styles.dot} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4EF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.brand, marginRight: 6 },
  text: { color: colors.brand, fontWeight: '700', fontSize: 12 },
});
