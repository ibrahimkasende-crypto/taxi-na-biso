import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../config/brand';
import { IconBack } from './TnbIcons';

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
};

export function OverlayHeader({ title, subtitle, onBack }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} style={styles.back} accessibilityLabel="Retour" hitSlop={8}>
        <IconBack />
      </Pressable>
      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.sub} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  texts: { flex: 1 },
  title: { fontSize: 18, fontWeight: '800', color: colors.ink },
  sub: { marginTop: 2, fontSize: 13, color: colors.textMuted },
});
