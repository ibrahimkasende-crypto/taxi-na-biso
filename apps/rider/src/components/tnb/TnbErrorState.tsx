import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../config/brand';
import { TnbButton } from './TnbButton';

export function TnbErrorState({
  title,
  subtitle,
  onRetry,
}: {
  title: string;
  subtitle: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{subtitle}</Text>
      {onRetry ? <View style={styles.btn}><TnbButton label="Réessayer" onPress={onRetry} /></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 24 },
  title: { fontSize: 17, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  sub: { marginTop: 8, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  btn: { marginTop: 16, alignSelf: 'stretch' },
});
