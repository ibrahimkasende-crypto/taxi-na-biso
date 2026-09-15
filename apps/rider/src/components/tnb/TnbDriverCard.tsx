import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../config/brand';
import type { DemoAssignedDriver } from '../../features/home/demoDriver';
import { IconChat, IconPhone, IconShare, IconShield } from './TnbIcons';

type Props = {
  driver: DemoAssignedDriver;
  onCall: () => void;
  onMessage: () => void;
  onShare: () => void;
  onSafety: () => void;
};

export function TnbDriverCard({ driver, onCall, onMessage, onShare, onSafety }: Props) {
  return (
    <View>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.initial}>{driver.displayName.slice(0, 1)}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.name}>{driver.displayName}</Text>
          <Text style={styles.sub}>
            {driver.rating.toFixed(1).replace('.', ',')} · {driver.vehicle} · {driver.color}
          </Text>
          <Text style={styles.plate}>{driver.plate}</Text>
        </View>
        <View style={styles.etaBox}>
          <Text style={styles.eta}>{driver.etaMinutes} min</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Action label="Appeler" onPress={onCall}>
          <IconPhone color={colors.white} />
        </Action>
        <Action label="Message" ghost onPress={onMessage}>
          <IconChat color={colors.ink} />
        </Action>
        <Action label="Partager" ghost onPress={onShare}>
          <IconShare color={colors.ink} />
        </Action>
        <Action label="Sécurité" ghost onPress={onSafety}>
          <IconShield color={colors.ink} />
        </Action>
      </View>
    </View>
  );
}

function Action({
  children,
  label,
  onPress,
  ghost,
}: {
  children: ReactNode;
  label: string;
  onPress: () => void;
  ghost?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <View style={[styles.actionBtn, ghost && styles.ghost]}>{children}</View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { color: colors.white, fontWeight: '800', fontSize: 20 },
  meta: { flex: 1, marginLeft: 12 },
  name: { fontSize: 17, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  plate: { fontSize: 13, fontWeight: '700', color: colors.ink, marginTop: 4 },
  etaBox: { backgroundColor: '#FFF4EF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  eta: { color: colors.brand, fontWeight: '800' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  action: { alignItems: 'center', width: '23%' },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: { backgroundColor: '#F3F4F6' },
  actionLabel: { marginTop: 6, fontSize: 11, color: colors.textMuted, fontWeight: '600' },
});
