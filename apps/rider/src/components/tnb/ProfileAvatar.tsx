import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  LOCAL_DEFAULT_AVATAR,
  defaultClientAvatar,
  fallbackAvatar,
  runtimeAvatar,
} from '../../config/assets';
import { colors } from '../../config/brand';
import { useReduceMotion } from '../../lib/reduceMotion';
import { FallbackImage } from './FallbackImage';
import { TnbSkeleton } from './TnbSkeleton';

type Props = {
  uri?: string | null;
  size?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  discreet?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ProfileAvatar({
  uri,
  size = 48,
  onPress,
  accessibilityLabel = 'Photo de profil',
  discreet = false,
  style,
}: Props) {
  const reduce = useReduceMotion();
  const appear = useRef(new Animated.Value(1)).current;
  const breath = useRef(new Animated.Value(1)).current;
  const ring = useRef(new Animated.Value(0.35)).current;
  const press = useRef(new Animated.Value(1)).current;
  const [remoteFailed, setRemoteFailed] = useState(false);
  const [loadingRemote, setLoadingRemote] = useState(Boolean(uri && uri.startsWith('http')));
  const isAltLocal = uri === LOCAL_DEFAULT_AVATAR;
  const remote = uri && !remoteFailed && uri.startsWith('http') ? { uri } : null;

  useEffect(() => {
    setRemoteFailed(false);
    setLoadingRemote(Boolean(uri && uri.startsWith('http')));
  }, [uri]);

  useEffect(() => {
    if (reduce) return;
    appear.setValue(0.4);
    Animated.timing(appear, {
      toValue: 1,
      duration: discreet ? 280 : 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: discreet ? 1.012 : 1.025,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const ringLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ring, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ring, {
          toValue: 0.22,
          duration: 4200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    breathLoop.start();
    ringLoop.start();
    return () => {
      breathLoop.stop();
      ringLoop.stop();
    };
  }, [appear, breath, discreet, reduce, ring]);

  const ringSize = size + 10;
  const photo = remote ? (
    <FallbackImage
      source={remote}
      fallback={runtimeAvatar}
      resizeMode="cover"
      style={{ width: size, height: size, borderRadius: size / 2 }}
      onLoad={() => setLoadingRemote(false)}
      accessibilityLabel={accessibilityLabel}
    />
  ) : (
    <FallbackImage
      source={isAltLocal ? defaultClientAvatar : runtimeAvatar}
      fallback={isAltLocal ? defaultClientAvatar : fallbackAvatar}
      resizeMode="cover"
      style={{ width: size, height: size, borderRadius: size / 2 }}
      accessibilityLabel={accessibilityLabel}
    />
  );

  const content = (
    <Animated.View
      style={[
        styles.wrap,
        { width: ringSize, height: ringSize },
        style,
        {
          opacity: appear,
          transform: [
            {
              scale: Animated.multiply(breath, press),
            },
          ],
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            opacity: ring,
            transform: [{ scale: ring.interpolate({ inputRange: [0.22, 1], outputRange: [0.96, 1.06] }) }],
          },
        ]}
      />
      <View style={[styles.avatarWrap, { width: size, height: size, borderRadius: size / 2 }]}>
        {photo}
        {loadingRemote && remote ? (
          <View style={StyleSheet.absoluteFill}>
            <TnbSkeleton height={size} width={size} radius={size / 2} gap={0} />
          </View>
        ) : null}
      </View>
    </Animated.View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => {
        Animated.spring(press, { toValue: 0.94, useNativeDriver: true, friction: 7 }).start();
      }}
      onPressOut={() => {
        Animated.spring(press, { toValue: 1, useNativeDriver: true, friction: 7 }).start();
      }}
      onPress={onPress}
      hitSlop={8}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.brand,
  },
  avatarWrap: {
    borderWidth: 3,
    borderColor: colors.white,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    shadowColor: '#111827',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
