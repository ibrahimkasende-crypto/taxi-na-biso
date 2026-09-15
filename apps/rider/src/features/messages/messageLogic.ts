import type { ChatMessage, Conversation } from './messageTypes';

export type MessageBundle = { conversations: Conversation[]; messages: ChatMessage[] };

export function appendOutgoing(
  bundle: MessageBundle,
  conversationId: string,
  text: string,
): { bundle: MessageBundle; message: ChatMessage } {
  const message: ChatMessage = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    conversationId,
    fromMe: true,
    text,
    createdAt: new Date().toISOString(),
    status: 'sending',
  };
  const conversations = bundle.conversations.map((item) =>
    item.id === conversationId
      ? { ...item, lastMessage: text, lastAt: message.createdAt, unreadCount: 0 }
      : item,
  );
  return { bundle: { conversations, messages: [...bundle.messages, message] }, message };
}

export function markMessageStatus(bundle: MessageBundle, id: string, status: ChatMessage['status']): MessageBundle {
  return {
    conversations: bundle.conversations,
    messages: bundle.messages.map((item) => (item.id === id ? { ...item, status } : item)),
  };
}

export function markConversationRead(bundle: MessageBundle, conversationId: string): MessageBundle {
  return {
    conversations: bundle.conversations.map((item) =>
      item.id === conversationId ? { ...item, unreadCount: 0 } : item,
    ),
    messages: bundle.messages.map((item) =>
      item.conversationId === conversationId && !item.fromMe ? { ...item, status: 'read' } : item,
    ),
  };
}

export function unreadTotal(conversations: Conversation[]): number {
  return conversations.reduce((sum, item) => sum + item.unreadCount, 0);
}
