export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type ChatMessage = {
  id: string;
  conversationId: string;
  fromMe: boolean;
  text: string;
  createdAt: string;
  status: MessageStatus;
};

export type Conversation = {
  id: string;
  name: string;
  avatarKey: 'driver' | 'support';
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
  online?: boolean;
  lastSeen?: string;
  phone?: string;
};
