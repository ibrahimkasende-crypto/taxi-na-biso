import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileAvatar } from '../../../components/tnb/ProfileAvatar';
import { colors } from '../../../config/brand';
import { useReduceMotion } from '../../../lib/reduceMotion';

type Props = {
  photoUri?: string | null;
  hasNotification?: boolean;
  onPressProfile: () => void;
  onPressNotifications: () => void;
};

export function HomeHeader({ photoUri, hasNotification, onPressProfile, onPressNotifications }: Props) {
  const reduce = useReduceMotion();
  const fade = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  const swing = useRef(new Animated.Value(0)).current;
  const prevUnread = useRef(false);

  useEffect(() => {
    if (reduce) {
      fade.setValue(1);
      return;
    }
    Animated.timing(fade, { toValue: 1, duration: 380, useNativeDriver: true }).start();
  }, [fade, reduce]);

  useEffect(() => {
    if (hasNotification && !prevUnread.current && !reduce) {
      Animated.sequence([
        Animated.timing(swing, { toValue: 1, duration: 90, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(swing, { toValue: -1, duration: 90, useNativeDriver: true }),
        Animated.timing(swing, { toValue: 0.6, duration: 80, useNativeDriver: true }),
        Animated.timing(swing, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }
    prevUnread.current = Boolean(hasNotification);
  }, [hasNotification, reduce, swing]);

  return (
    <Animated.View style={[styles.row, { opacity: fade }]}>
      <View style={styles.left}>
        <ProfileAvatar uri={photoUri} size={48} onPress={onPressProfile} />
        <View style={styles.texts}>
          <Text style={styles.hello}>Bonjour 👋</Text>
          <Text style={styles.title} numberOfLines={2}>
            Où allez-vous aujourd’hui ?
          </Text>
        </View>
      </View>
      <Pressable
        accessibilityLabel="Notifications"
        onPress={onPressNotifications}
        style={({ pressed }) => [styles.bell, pressed && styles.pressed]}
      >
        <Animated.View
          style={{
            transform: [
              {
                rotate: swing.interpolate({
                  inputRange: [-1, 1],
                  outputRange: ['-14deg', '14deg'],
                }),
              },
            ],
          }}
        >
          <View style={styles.bellBody} />
          <View style={styles.bellClapper} />
        </Animated.View>
        {hasNotification ? <View style={styles.dot} /> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 },
  texts: { flex: 1, marginLeft: 4 },
  hello: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  title: { fontSize: 20, lineHeight: 24, fontWeight: '800', color: '#111827', marginTop: 2 },
  bell: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pressed: { transform: [{ scale: 0.96 }] },
  bellBody: {
    width: 16,
    height: 15,
    borderWidth: 2,
    borderColor: '#111827',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  bellClapper: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#111827',
    marginTop: 1,
    alignSelf: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
});
