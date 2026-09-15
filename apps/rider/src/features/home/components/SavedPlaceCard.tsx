import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../config/brand';

type Kind = 'home' | 'work' | 'airport';

type Props = {
  kind: Kind;
  title: string;
  subtitle: string;
  onPress: () => void;
};

function PlaceGlyph({ kind }: { kind: Kind }) {
  if (kind === 'home') {
    return <View style={styles.home} />;
  }
  if (kind === 'work') {
    return <View style={styles.case} />;
  }
  return <View style={styles.plane} />;
}

export function SavedPlaceCard({ kind, title, subtitle, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.iconWrap}>
        <PlaceGlyph kind={kind} />
      </View>
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 148,
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEF0F3',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 10,
    shadowColor: '#111827',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: { transform: [{ scale: 0.98 }] },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF1EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  meta: { flex: 1 },
  title: { fontSize: 14, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  chevron: { fontSize: 22, color: '#9CA3AF', marginLeft: 4, marginTop: -2 },
  home: {
    width: 14,
    height: 12,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderTopWidth: 2,
    borderColor: colors.brand,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  case: {
    width: 14,
    height: 11,
    borderWidth: 2,
    borderColor: colors.brand,
    borderRadius: 2,
  },
  plane: {
    width: 16,
    height: 8,
    borderWidth: 2,
    borderColor: colors.brand,
    borderRadius: 8,
    transform: [{ rotate: '-20deg' }],
  },
});
