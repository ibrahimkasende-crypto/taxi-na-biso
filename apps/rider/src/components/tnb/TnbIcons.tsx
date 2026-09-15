import { StyleSheet, View } from 'react-native';

import { colors } from '../../config/brand';

type IconProps = { color?: string; size?: number };

export function IconSearch({ color = colors.ink, size = 20 }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[styles.searchRing, { borderColor: color, width: size * 0.62, height: size * 0.62 }]} />
      <View
        style={[
          styles.searchHandle,
          { backgroundColor: color, width: size * 0.28, right: size * 0.08, bottom: size * 0.12 },
        ]}
      />
    </View>
  );
}

export function IconBell({ color = colors.ink, size = 20 }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={[styles.bell, { borderColor: color, width: size * 0.62, height: size * 0.58 }]} />
      <View style={[styles.bellClapper, { backgroundColor: color }]} />
    </View>
  );
}

export function IconShield({ color = colors.ink, size = 20 }: IconProps) {
  return (
    <View style={[styles.shield, { borderColor: color, width: size * 0.62, height: size * 0.72 }]} />
  );
}

export function IconLocate({ color = colors.brand, size = 20 }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[styles.locateOuter, { borderColor: color, width: size * 0.7, height: size * 0.7 }]} />
      <View style={[styles.locateDot, { backgroundColor: color }]} />
    </View>
  );
}

export function IconCalendar({ color = colors.textMuted, size = 20 }: IconProps) {
  return (
    <View style={[styles.calendar, { borderColor: color, width: size * 0.72, height: size * 0.68 }]}>
      <View style={[styles.calendarBar, { backgroundColor: color }]} />
    </View>
  );
}

export function IconBack({ color = colors.ink, size = 20 }: IconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center' }}>
      <View style={[styles.backArm, { backgroundColor: color, width: size * 0.55 }]} />
      <View style={[styles.backHead, { borderColor: color, left: 2 }]} />
    </View>
  );
}

export function IconPin({ color = colors.brand, size = 18 }: IconProps) {
  return <View style={[styles.pin, { backgroundColor: color, width: size * 0.45, height: size * 0.45 }]} />;
}

export function IconHome({ color = colors.ink, size = 20 }: IconProps) {
  return <View style={[styles.home, { borderColor: color, width: size * 0.7, height: size * 0.55 }]} />;
}

export function IconClock({ color = colors.ink, size = 20 }: IconProps) {
  return (
    <View style={[styles.clock, { borderColor: color, width: size * 0.7, height: size * 0.7 }]}>
      <View style={[styles.clockHand, { backgroundColor: color }]} />
    </View>
  );
}

export function IconUser({ color = colors.ink, size = 20 }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View style={[styles.userHead, { borderColor: color }]} />
      <View style={[styles.userBody, { borderColor: color }]} />
    </View>
  );
}

export function IconChat({ color = colors.ink, size = 20 }: IconProps) {
  return <View style={[styles.chat, { borderColor: color, width: size * 0.72, height: size * 0.55 }]} />;
}

export function IconPhone({ color = colors.white, size = 18 }: IconProps) {
  return <View style={[styles.phone, { borderColor: color, width: size * 0.45, height: size * 0.72 }]} />;
}

export function IconShare({ color = colors.ink }: IconProps) {
  return <View style={[styles.share, { borderColor: color }]} />;
}

const styles = StyleSheet.create({
  searchRing: { borderWidth: 2, borderRadius: 99 },
  searchHandle: { position: 'absolute', height: 2, transform: [{ rotate: '40deg' }] },
  bell: { borderWidth: 2, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  bellClapper: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
  shield: { borderWidth: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  locateOuter: { borderWidth: 2, borderRadius: 99 },
  locateDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
  calendar: { borderWidth: 2, borderRadius: 4, overflow: 'hidden' },
  calendarBar: { height: 5, marginTop: 4 },
  backArm: { height: 2, alignSelf: 'center' },
  backHead: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  pin: { borderRadius: 99 },
  home: { borderWidth: 2, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  clock: { borderWidth: 2, borderRadius: 99, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 },
  clockHand: { width: 2, height: 7 },
  userHead: { width: 8, height: 8, borderRadius: 4, borderWidth: 2, marginTop: 2 },
  userBody: { width: 14, height: 8, borderWidth: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8, marginTop: 2 },
  chat: { borderWidth: 2, borderRadius: 6 },
  phone: { borderWidth: 2, borderRadius: 3 },
  share: { width: 10, height: 10, borderWidth: 2, borderRadius: 99 },
});
