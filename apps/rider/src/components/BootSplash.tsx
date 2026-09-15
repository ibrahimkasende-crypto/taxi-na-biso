import { Image, StyleSheet, View } from 'react-native';

import { riderAssets } from '../config/assets';
import { colors } from '../config/brand';

/** Splash JS : même visuel que le splash natif, le temps de charger la session. */
export function BootSplash() {
  return (
    <View style={styles.container}>
      <Image source={riderAssets.splash} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
