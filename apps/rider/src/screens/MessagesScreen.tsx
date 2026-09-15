import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenEnter } from '../components/tnb/ScreenEnter';
import { TnbEmptyState } from '../components/tnb/TnbEmptyState';
import { riderAssets } from '../config/assets';
import { colors } from '../config/brand';
import { useMessageStore } from '../features/messages/messageStore';
import type { Conversation } from '../features/messages/messageTypes';
import { useShellStore } from '../navigation/shellStore';

function formatListTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday.getTime() - 86400000);
  if (date >= startToday) return date.toLocaleTimeString('fr-CD', { hour: '2-digit', minute: '2-digit' });
  if (date >= startYesterday) return 'Hier';
  return date.toLocaleDateString('fr-CD', { day: 'numeric', month: 'short' });
}

export function MessagesScreen() {
  const conversations = useMessageStore((s) => s.conversations);
  const push = useShellStore((s) => s.push);
  const openConversation = useMessageStore((s) => s.openConversation);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((item) => {
      if (tab === 'unread' && item.unreadCount === 0) return false;
      if (!q) return true;
      return item.name.toLowerCase().includes(q) || item.lastMessage.toLowerCase().includes(q);
    });
  }, [conversations, query, tab]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenEnter>
        <View style={styles.pad}>
          <Text style={styles.title}>Messages</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher"
            placeholderTextColor={colors.textMuted}
            style={styles.search}
            accessibilityLabel="Rechercher une conversation"
          />
          <View style={styles.tabs}>
            {(['all', 'unread'] as const).map((id) => (
              <Pressable
                key={id}
                onPress={() => setTab(id)}
                style={[styles.tab, tab === id && styles.tabOn]}
                accessibilityLabel={id === 'all' ? 'Tous' : 'Non lus'}
              >
                <Text style={[styles.tabText, tab === id && styles.tabTextOn]}>{id === 'all' ? 'Tous' : 'Non lus'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          {visible.length === 0 ? (
            <TnbEmptyState
              title="Aucune conversation"
              subtitle="Les échanges avec le chauffeur et l’assistance apparaîtront ici."
            />
          ) : (
            visible.map((item) => (
              <ConversationRow
                key={item.id}
                item={item}
                onPress={() => {
                  openConversation(item.id);
                  push({ id: 'conversation', conversationId: item.id });
                }}
              />
            ))
          )}
        </ScrollView>
      </ScreenEnter>
    </SafeAreaView>
  );
}

function ConversationRow({ item, onPress }: { item: Conversation; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]} accessibilityLabel={item.name}>
      <View>
        <Image
          source={item.avatarKey === 'support' ? riderAssets.symbol : riderAssets.defaultAvatar}
          style={styles.avatar}
        />
        {item.online ? <View style={styles.online} /> : null}
      </View>
      <View style={styles.meta}>
        <View style={styles.top}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.time}>{formatListTime(item.lastAt)}</Text>
        </View>
        <View style={styles.top}>
          <Text style={styles.preview} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  pad: { paddingHorizontal: 20, paddingTop: 8 },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, marginBottom: 12 },
  search: {
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#EEF0F3',
    paddingHorizontal: 14,
    color: colors.ink,
    marginBottom: 12,
  },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tab: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF0F3',
  },
  tabOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  tabText: { fontWeight: '700', color: colors.textMuted },
  tabTextOn: { color: colors.white },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  pressed: { opacity: 0.85 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#EEE' },
  online: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
  meta: { flex: 1, marginLeft: 12 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, fontSize: 16, fontWeight: '800', color: colors.ink },
  time: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  preview: { flex: 1, marginTop: 4, color: colors.textMuted },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '800' },
});
