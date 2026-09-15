import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../config/brand';

type Props = {
  onPressSearch: () => void;
  onPressSchedule: () => void;
};

export function DestinationSearchBar({ onPressSearch, onPressSchedule }: Props) {
  const rise = useRef(new Animated.Value(12)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 360, useNativeDriver: true }),
      Animated.spring(rise, { toValue: 0, useNativeDriver: true, friction: 8, tension: 70 }),
    ]).start();
  }, [fade, rise]);

  return (
    <Animated.View style={[styles.wrap, { opacity: fade, transform: [{ translateY: rise }] }]}>
      <Pressable onPress={onPressSearch} style={({ pressed }) => [styles.bar, pressed && styles.pressed]}>
        <View style={styles.pin}>
          <View style={styles.pinOuter} />
          <View style={styles.pinInner} />
        </View>
        <Text style={styles.placeholder}>Où allez-vous ?</Text>
        <View style={styles.divider} />
        <Pressable
          accessibilityLabel="Planifier une course"
          onPress={onPressSchedule}
          hitSlop={8}
          style={styles.calHit}
        >
          <View style={styles.cal} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 14 },
  bar: {
    height: 66,
    borderRadius: 28,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#111827',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  pressed: { transform: [{ scale: 0.995 }] },
  pin: { width: 22, height: 26, alignItems: 'center' },
  pinOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: colors.brand,
  },
  pinInner: {
    width: 4,
    height: 8,
    backgroundColor: colors.brand,
    marginTop: -1,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  placeholder: { flex: 1, marginLeft: 12, fontSize: 16, color: '#9CA3AF', fontWeight: '500' },
  divider: { width: 1, height: 28, backgroundColor: '#E5E7EB', marginHorizontal: 10 },
  calHit: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  cal: {
    width: 18,
    height: 16,
    borderWidth: 1.8,
    borderColor: '#6B7280',
    borderRadius: 4,
  },
});
