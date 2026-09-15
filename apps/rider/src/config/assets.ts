/**
 * Mapping visuel Taxi Na Biso.
 * require() statiques uniquement — Metro n’accepte pas un chemin construit.
 */
import { Platform } from 'react-native';

import fallbackAvatar from '../../assets/ikas-profile.jpeg';
import taxiCarImage from '../../assets/taxi-car-side.png';
import splashPassenger from '../../assets/splash-passenger.png';
import wordmarkLight from '../../assets/monochrome-icon.png';
import wordmarkDark from '../../assets/adaptive-icon.png';
import symbolPin from '../../assets/logo-horizontal-light.png';
import defaultClientAvatar from '../../assets/default-client-avatar.png';

export { fallbackAvatar, taxiCarImage, defaultClientAvatar };

const packedAndroid = Platform.OS === 'android' && !(typeof __DEV__ !== 'undefined' && __DEV__);

/** URI unique + dimensions : Fabric refuse un tableau sans width. */
export const ANDROID_PACKED_AVATAR = {
  uri: 'file:///android_asset/ikas-profile.jpeg',
  width: 473,
  height: 529,
} as const;
export const ANDROID_PACKED_TAXI = {
  uri: 'file:///android_asset/taxi-car-side.png',
  width: 707,
  height: 353,
} as const;

export const runtimeAvatar = packedAndroid ? ANDROID_PACKED_AVATAR : fallbackAvatar;
export const runtimeTaxiCar = packedAndroid ? ANDROID_PACKED_TAXI : taxiCarImage;
export const LOCAL_DEFAULT_AVATAR = 'local:default-client-avatar';

export const riderAssets = {
  splash: splashPassenger,
  logoOnLight: wordmarkLight,
  logoOnDark: wordmarkDark,
  symbol: symbolPin,
  taxiCar: taxiCarImage,
  profilePhoto: fallbackAvatar,
  defaultAvatar: defaultClientAvatar,
} as const;
