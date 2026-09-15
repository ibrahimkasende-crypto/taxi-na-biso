import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconChat, IconClock, IconHome, IconShield, IconUser } from '../components/tnb/TnbIcons';
import { colors } from '../config/brand';
import { HomeMapScreen } from '../features/home/HomeMapScreen';
import { readDemoTrips } from '../features/home/demoTrips';
import { useHomeStore } from '../features/home/homeStore';
import { unreadTotal } from '../features/messages/messageService';
import { useMessageStore } from '../features/messages/messageStore';
import { useNotificationStore } from '../features/notifications/notificationStore';
import { AccountScreen } from '../screens/AccountScreen';
import { ActivityScreen } from '../screens/ActivityScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { SafetyScreen } from '../screens/SafetyScreen';
import { ShellOverlay } from './ShellOverlays';
import { useShellStore, type MainTab } from './shellStore';

const TABS: { id: MainTab; label: string; Icon: typeof IconHome }[] = [
  { id: 'home', label: 'Accueil', Icon: IconHome },
  { id: 'activity', label: 'Activité', Icon: IconClock },
  { id: 'safety', label: 'Sécurité', Icon: IconShield },
  { id: 'messages', label: 'Messages', Icon: IconChat },
  { id: 'account', label: 'Compte', Icon: IconUser },
];

export function MainShell({ displayName, phone }: { displayName?: string | null; phone?: string | null }) {
  const tab = useShellStore((s) => s.tab);
  const setTab = useShellStore((s) => s.setTab);
  const insets = useSafeAreaInsets();
  const hydrateTrips = useHomeStore((s) => s.hydrateTrips);
  const hydrateNotifs = useNotificationStore((s) => s.hydrate);
  const hydrateMessages = useMessageStore((s) => s.hydrate);
  const conversations = useMessageStore((s) => s.conversations);
  const stack = useShellStore((s) => s.stack);
  const unread = unreadTotal(conversations);

  useEffect(() => {
    void readDemoTrips().then(hydrateTrips);
    hydrateNotifs([]);
    void hydrateMessages();
  }, [hydrateMessages, hydrateNotifs, hydrateTrips]);

  return (
    <View style={styles.root}>
      <View style={styles.page}>
        <HomeMapScreen onOpenTab={(next) => setTab(next)} />
      </View>
      {tab !== 'home' ? (
        <View style={styles.overlay}>
          {tab === 'activity' ? <ActivityScreen /> : null}
          {tab === 'safety' ? <SafetyScreen /> : null}
          {tab === 'messages' ? <MessagesScreen /> : null}
          {tab === 'account' ? <AccountScreen displayName={displayName} phone={phone} /> : null}
        </View>
      ) : null}
      {stack.length > 0 ? (
        <View style={[styles.overlay, styles.stack]}>
          <ShellOverlay />
        </View>
      ) : null}
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <Pressable key={item.id} onPress={() => setTab(item.id)} style={styles.tab} accessibilityLabel={item.label}>
              <View style={[styles.iconWrap, active && styles.iconOn]}>
                <item.Icon color={active ? colors.brand : '#4B5563'} />
                {item.id === 'messages' && unread > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unread > 9 ? '9+' : String(unread)}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.tabLabel, active && styles.tabActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FB' },
  page: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFill, bottom: 76, backgroundColor: '#F8F9FB' },
  stack: { zIndex: 3 },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingTop: 6,
    borderTopWidth: 0,
    shadowColor: '#111827',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 4,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 56 },
  iconWrap: { width: 44, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconOn: { backgroundColor: '#FFE8DF' },
  tabLabel: { marginTop: 2, fontSize: 11, color: '#6B7280', fontWeight: '600' },
  tabActive: { color: colors.brand },
  badge: {
    position: 'absolute',
    top: -2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: '800' },
});
