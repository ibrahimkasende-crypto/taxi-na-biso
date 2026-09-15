import { StyleSheet, View } from 'react-native';

import { colors } from '../config/brand';

function Pin({ style }: { style: object }) {
  return (
    <View style={[styles.pin, style]} pointerEvents="none">
      <View style={styles.pinHead} />
      <View style={styles.pinTip} />
    </View>
  );
}

export function AuthBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.wash} />
      <View style={styles.circleLg} />
      <View style={styles.circleSm} />
      <View style={styles.roadA} />
      <View style={styles.roadB} />
      <View style={styles.dotA} />
      <View style={styles.dotB} />
      <View style={styles.dotC} />
      <Pin style={styles.pinA} />
      <Pin style={styles.pinB} />
    </View>
  );
}

const styles = StyleSheet.create({
  wash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
  circleLg: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#F04A18',
    opacity: 0.07,
  },
  circleSm: {
    position: 'absolute',
    top: 210,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F04A18',
    opacity: 0.06,
  },
  roadA: {
    position: 'absolute',
    top: 430,
    left: -40,
    width: 220,
    height: 2,
    backgroundColor: '#F04A18',
    opacity: 0.06,
    transform: [{ rotate: '-18deg' }],
  },
  roadB: {
    position: 'absolute',
    bottom: 180,
    right: -30,
    width: 200,
    height: 2,
    backgroundColor: '#111827',
    opacity: 0.04,
    transform: [{ rotate: '16deg' }],
  },
  dotA: {
    position: 'absolute',
    top: 160,
    right: 36,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F04A18',
    opacity: 0.12,
  },
  dotB: {
    position: 'absolute',
    top: 320,
    left: 28,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#111827',
    opacity: 0.08,
  },
  dotC: {
    position: 'absolute',
    bottom: 120,
    left: 70,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F04A18',
    opacity: 0.08,
  },
  pin: {
    position: 'absolute',
    alignItems: 'center',
    opacity: 0.1,
  },
  pinHead: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F04A18',
  },
  pinTip: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F04A18',
  },
  pinA: { top: 88, left: 22 },
  pinB: { bottom: 90, right: 28 },
});
