import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OverlayHeader } from '../../components/tnb/OverlayHeader';
import { ScreenEnter } from '../../components/tnb/ScreenEnter';
import { TnbEmptyState } from '../../components/tnb/TnbEmptyState';
import { colors } from '../../config/brand';
import { useNotificationStore } from './notificationStore';

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString('fr-CD', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('fr-CD', { day: 'numeric', month: 'short' });
}

export function NotificationCenter({ onBack }: { onBack: () => void }) {
  const items = useNotificationStore((s) => s.items);
  const markRead = useNotificationStore((s) => s.markRead);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenEnter>
        <OverlayHeader title="Notifications" subtitle="Vos dernières actualités" onBack={onBack} />
        <ScrollView contentContainerStyle={styles.content}>
          {items.length === 0 ? (
            <TnbEmptyState title="Aucune notification" subtitle="Les mises à jour de vos courses apparaîtront ici." />
          ) : (
            items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => markRead(item.id)}
                style={[styles.card, !item.read && styles.unread]}
                accessibilityLabel={item.title}
              >
                <View style={styles.row}>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {!item.read ? <View style={styles.dot} /> : null}
                </View>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.when}>{formatWhen(item.createdAt)}</Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      </ScreenEnter>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  unread: { borderColor: '#FECABA', backgroundColor: '#FFF8F5' },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  title: { flex: 1, fontSize: 15, fontWeight: '800', color: colors.ink },
  body: { marginTop: 6, fontSize: 14, lineHeight: 20, color: colors.textMuted },
  when: { marginTop: 8, fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand, marginTop: 6 },
});
