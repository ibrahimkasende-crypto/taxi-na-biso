import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors } from '../../../config/brand';

export function UserLocationMarker() {
  const pulse = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.55, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={[styles.ring, { opacity: pulse, transform: [{ scale: pulse }] }]} />
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(240,74,24,0.18)',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.brand,
    borderWidth: 3,
    borderColor: colors.white,
  },
});
