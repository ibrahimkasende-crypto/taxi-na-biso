import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { runtimeTaxiCar, taxiCarImage } from '../../../config/assets';
import { FallbackImage } from '../../../components/tnb/FallbackImage';

export function PromotionalBanner() {
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const bannerW = Math.min(width - 32, 640);
  const carW = Math.round(bannerW * (compact ? 0.42 : 0.46));
  const carH = compact ? 72 : 92;

  return (
    <View style={[styles.banner, compact && styles.bannerCompact]}>
      <View style={styles.gradDark} pointerEvents="none" />
      <View style={styles.skyline} pointerEvents="none" />
      <View style={styles.skylineFar} pointerEvents="none" />
      <View style={styles.copy}>
        <Text style={[styles.title, compact && styles.titleSm]}>Kinshasa bouge avec vous</Text>
        <Text style={[styles.sub, compact && styles.subSm]}>Des chauffeurs proches, un trajet en toute confiance.</Text>
      </View>
      <FallbackImage
        source={runtimeTaxiCar}
        fallback={taxiCarImage}
        resizeMode="contain"
        accessibilityLabel="Taxi Na Biso"
        style={[styles.car, { width: carW, height: carH }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 118,
    borderRadius: 22,
    backgroundColor: '#F04A18',
    overflow: 'hidden',
    justifyContent: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    shadowColor: '#111827',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  bannerCompact: { height: 108 },
  gradDark: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '38%',
    backgroundColor: '#D83E10',
    opacity: 0.28,
  },
  skyline: {
    position: 'absolute',
    right: 18,
    bottom: 0,
    width: 120,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderTopLeftRadius: 28,
    zIndex: 0,
  },
  skylineFar: {
    position: 'absolute',
    right: 70,
    bottom: 16,
    width: 56,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderTopLeftRadius: 16,
    zIndex: 0,
  },
  copy: { width: '54%', zIndex: 2, elevation: 2 },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', lineHeight: 20 },
  titleSm: { fontSize: 14, lineHeight: 18 },
  sub: { color: 'rgba(255,255,255,0.92)', fontSize: 12, lineHeight: 16, marginTop: 6, fontWeight: '500' },
  subSm: { fontSize: 11, lineHeight: 14 },
  car: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    zIndex: 3,
    elevation: 6,
  },
});
