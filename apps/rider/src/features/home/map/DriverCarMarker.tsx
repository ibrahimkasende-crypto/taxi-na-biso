import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../../../config/brand';

type Props = {
  heading: number;
  onPress?: () => void;
};

/** Petit pictogramme carte — pas taxi-car-side (réservé à la bannière). */
export function DriverCarMarker({ heading, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.wrap, { transform: [{ rotate: `${heading}deg` }] }]} hitSlop={8}>
      <View style={styles.body} />
      <View style={styles.cabin} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 28, height: 16, alignItems: 'center', justifyContent: 'center' },
  body: {
    width: 22,
    height: 8,
    borderRadius: 3,
    backgroundColor: colors.ink,
  },
  cabin: {
    position: 'absolute',
    width: 10,
    height: 7,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: colors.brand,
    top: 1,
  },
});
