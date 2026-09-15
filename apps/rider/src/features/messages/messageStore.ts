import { create } from 'zustand';

import {
  appendOutgoing,
  loadConversations,
  markConversationRead,
  markMessageStatus,
  writeLocal,
} from './messageService';
import type { ChatMessage, Conversation } from './messageTypes';

type State = {
  conversations: Conversation[];
  messages: ChatMessage[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  openConversation: (id: string) => void;
  send: (conversationId: string, text: string) => Promise<void>;
  retry: (id: string) => Promise<void>;
};

function bundleOf(state: Pick<State, 'conversations' | 'messages'>) {
  return { conversations: state.conversations, messages: state.messages };
}

export const useMessageStore = create<State>((set, get) => ({
  conversations: [],
  messages: [],
  hydrated: false,
  hydrate: async () => {
    const bundle = await loadConversations();
    set({ ...bundle, hydrated: true });
  },
  openConversation: (id) => {
    const next = markConversationRead(bundleOf(get()), id);
    set(next);
    void writeLocal(next);
  },
  send: async (conversationId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const { bundle, message } = appendOutgoing(bundleOf(get()), conversationId, trimmed);
    set(bundle);
    void writeLocal(bundle);
    try {
      // Prêt pour un insert Supabase lorsque la table existera.
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 180);
      });
      const sent = markMessageStatus(bundleOf(get()), message.id, 'sent');
      const delivered = markMessageStatus(sent, message.id, 'delivered');
      set(delivered);
      void writeLocal(delivered);
    } catch {
      const failed = markMessageStatus(bundleOf(get()), message.id, 'failed');
      set(failed);
      void writeLocal(failed);
    }
  },
  retry: async (id) => {
    const current = get().messages.find((item) => item.id === id);
    if (!current || current.status !== 'failed') return;
    const sending = markMessageStatus(bundleOf(get()), id, 'sending');
    set(sending);
    try {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 180);
      });
      const sent = markMessageStatus(sending, id, 'delivered');
      set(sent);
      void writeLocal(sent);
    } catch {
      const failed = markMessageStatus(sending, id, 'failed');
      set(failed);
      void writeLocal(failed);
    }
  },
}));
