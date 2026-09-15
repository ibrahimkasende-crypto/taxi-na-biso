import assert from 'node:assert/strict';
import { test } from 'node:test';

import { appendOutgoing, markConversationRead, markMessageStatus, unreadTotal } from './messageLogic';
import { DEMO_CONVERSATIONS, DEMO_MESSAGES } from './demoMessages';

test('optimistic send ajoute un seul message', () => {
  const start = { conversations: DEMO_CONVERSATIONS, messages: DEMO_MESSAGES };
  const first = appendOutgoing(start, 'demo-conv-support', 'Bonjour');
  const second = appendOutgoing(first.bundle, 'demo-conv-support', 'Bonjour');
  assert.equal(first.bundle.messages.length, DEMO_MESSAGES.length + 1);
  assert.equal(second.bundle.messages.length, DEMO_MESSAGES.length + 2);
  assert.notEqual(first.message.id, second.message.id);
});

test('statut failed puis retry vers delivered', () => {
  const start = { conversations: DEMO_CONVERSATIONS, messages: DEMO_MESSAGES };
  const { bundle, message } = appendOutgoing(start, 'demo-conv-jean', 'Test');
  const failed = markMessageStatus(bundle, message.id, 'failed');
  const delivered = markMessageStatus(failed, message.id, 'delivered');
  assert.equal(delivered.messages.find((item) => item.id === message.id)?.status, 'delivered');
});

test('ouvrir une conversation remet les non-lus à zéro', () => {
  const start = { conversations: DEMO_CONVERSATIONS, messages: DEMO_MESSAGES };
  assert.equal(unreadTotal(start.conversations) > 0, true);
  const next = markConversationRead(start, 'demo-conv-patrick');
  assert.equal(next.conversations.find((item) => item.id === 'demo-conv-patrick')?.unreadCount, 0);
});
