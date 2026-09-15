import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OverlayHeader } from '../../components/tnb/OverlayHeader';
import { riderAssets } from '../../config/assets';
import { colors } from '../../config/brand';
import { useMessageStore } from './messageStore';
import type { ChatMessage } from './messageTypes';

function sameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.toDateString() === db.toDateString();
}

function dateLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Aujourd’hui';
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  if (date.toDateString() === y.toDateString()) return 'Hier';
  return date.toLocaleDateString('fr-CD', { day: 'numeric', month: 'long' });
}

function ticks(status: ChatMessage['status']): string {
  if (status === 'sending') return '…';
  if (status === 'failed') return '!';
  if (status === 'read') return '✓✓';
  if (status === 'delivered') return '✓✓';
  return '✓';
}

export function ConversationScreen({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
  const conversations = useMessageStore((s) => s.conversations);
  const messages = useMessageStore((s) => s.messages);
  const send = useMessageStore((s) => s.send);
  const retry = useMessageStore((s) => s.retry);
  const conversation = conversations.find((item) => item.id === conversationId);
  const thread = useMemo(
    () => messages.filter((item) => item.conversationId === conversationId),
    [conversationId, messages],
  );
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    const id = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(id);
  }, [thread.length]);

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <OverlayHeader title="Conversation" onBack={onBack} />
        <Text style={styles.missing}>Conversation introuvable.</Text>
      </SafeAreaView>
    );
  }

  const status = conversation.online ? 'En ligne' : conversation.lastSeen ? `Vu ${dateLabel(conversation.lastSeen)}` : 'Hors ligne';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.head}>
        <OverlayHeader title={conversation.name} subtitle={status} onBack={onBack} />
        <View style={styles.actions}>
          {conversation.phone ? (
            <Pressable
              accessibilityLabel="Appeler"
              style={styles.iconBtn}
              onPress={() => void Linking.openURL(`tel:${conversation.phone}`)}
            >
              <Text style={styles.iconTxt}>☎</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityLabel="Informations"
            style={styles.iconBtn}
            onPress={() => Alert.alert(conversation.name, status)}
          >
            <Text style={styles.iconTxt}>i</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.identity}>
        <Image
          source={conversation.avatarKey === 'support' ? riderAssets.symbol : riderAssets.defaultAvatar}
          style={styles.avatar}
        />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={8}>
        <FlatList
          ref={listRef}
          data={thread}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.thread}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item, index }) => {
            const prev = thread[index - 1];
            const showDate = !prev || !sameDay(prev.createdAt, item.createdAt);
            return (
              <View>
                {showDate ? <Text style={styles.sep}>{dateLabel(item.createdAt)}</Text> : null}
                <Pressable
                  onPress={() => {
                    if (item.status === 'failed') void retry(item.id);
                  }}
                  style={[styles.bubble, item.fromMe ? styles.mine : styles.theirs]}
                >
                  <Text style={[styles.bubbleText, item.fromMe && styles.mineText]}>{item.text}</Text>
                  <Text style={[styles.meta, item.fromMe && styles.mineMeta]}>
                    {new Date(item.createdAt).toLocaleTimeString('fr-CD', { hour: '2-digit', minute: '2-digit' })}
                    {item.fromMe ? `  ${ticks(item.status)}` : ''}
                    {item.status === 'failed' ? '  Réessayer' : ''}
                  </Text>
                </Pressable>
              </View>
            );
          }}
        />

        <View style={styles.composer}>
          <Pressable
            accessibilityLabel="Pièce jointe"
            style={styles.attach}
            onPress={() => Alert.alert('Pièce jointe', 'L’envoi de fichiers sera disponible une fois le sélecteur installé.')}
          >
            <Text style={styles.attachTxt}>+</Text>
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Écrire un message…"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
            accessibilityLabel="Écrire un message"
          />
          <Pressable
            accessibilityLabel="Envoyer"
            disabled={draft.trim().length === 0}
            onPress={() => {
              const text = draft;
              setDraft('');
              void send(conversation.id, text);
            }}
            style={[styles.send, draft.trim().length === 0 && styles.sendOff]}
          >
            <Text style={styles.sendTxt}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  head: { position: 'relative' },
  actions: { position: 'absolute', right: 16, top: 0, flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTxt: { fontWeight: '800', color: colors.ink },
  identity: { alignItems: 'center', marginBottom: 4 },
  avatar: { width: 36, height: 36, borderRadius: 18, position: 'absolute', right: 112, top: -40, opacity: 0 },
  missing: { padding: 20, color: colors.textMuted },
  thread: { paddingHorizontal: 16, paddingBottom: 12 },
  sep: { alignSelf: 'center', marginVertical: 10, color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.brand },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.white },
  bubbleText: { color: colors.ink, fontSize: 15, lineHeight: 20 },
  mineText: { color: colors.white },
  meta: { marginTop: 4, fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  mineMeta: { color: 'rgba(255,255,255,0.85)', textAlign: 'right' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  attach: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachTxt: { fontSize: 22, color: colors.ink, fontWeight: '700' },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 18,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.ink,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOff: { opacity: 0.4 },
  sendTxt: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
