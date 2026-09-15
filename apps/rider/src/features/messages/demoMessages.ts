/**
 * TEMPORAIRE — conversations de développement si aucune donnée réelle n’existe.
 * Ne simule jamais un chauffeur réel en production.
 */

import type { ChatMessage, Conversation } from './messageTypes';

function todayAt(hours: number, minutes: number): string {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'demo-conv-patrick',
    name: 'Patrick Nzambe',
    avatarKey: 'driver',
    lastMessage: 'Je suis devant l’entrée principale.',
    lastAt: todayAt(10, 42),
    unreadCount: 2,
    online: true,
    phone: '+243810000099',
  },
  {
    id: 'demo-conv-support',
    name: 'Assistance Taxi Na Biso',
    avatarKey: 'support',
    lastMessage: 'Bonjour Ibrahim, comment pouvons-nous vous aider ?',
    lastAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'demo-conv-jean',
    name: 'Jean Mbala',
    avatarKey: 'driver',
    lastMessage: 'Merci pour votre course.',
    lastAt: '2026-09-14T16:40:00.000Z',
    unreadCount: 0,
    lastSeen: '2026-09-14T16:45:00.000Z',
  },
];

export const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'demo-m-p1',
    conversationId: 'demo-conv-patrick',
    fromMe: false,
    text: 'Bonjour, je suis en route.',
    createdAt: todayAt(10, 38),
    status: 'read',
  },
  {
    id: 'demo-m-p2',
    conversationId: 'demo-conv-patrick',
    fromMe: false,
    text: 'Je suis devant l’entrée principale.',
    createdAt: todayAt(10, 42),
    status: 'delivered',
  },
  {
    id: 'demo-m-s1',
    conversationId: 'demo-conv-support',
    fromMe: false,
    text: 'Bonjour Ibrahim, comment pouvons-nous vous aider ?',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    status: 'read',
  },
  {
    id: 'demo-m-j1',
    conversationId: 'demo-conv-jean',
    fromMe: true,
    text: 'Merci, bonne route.',
    createdAt: '2026-09-14T16:38:00.000Z',
    status: 'read',
  },
  {
    id: 'demo-m-j2',
    conversationId: 'demo-conv-jean',
    fromMe: false,
    text: 'Merci pour votre course.',
    createdAt: '2026-09-14T16:40:00.000Z',
    status: 'read',
  },
];
