/**
 * Couche messages prête pour Supabase.
 * Aucune table conversations/messages n’existe dans le schéma généré actuel :
 * on persiste localement et on expose fetchRemoteConversations() pour plus tard.
 */

import { supabase } from '../../lib/supabase';
import { secureStorage } from '../../lib/secure-storage';
import { isDevAuthBypass } from '../auth/demo/demoAuthEnabled';
import { DEMO_CONVERSATIONS, DEMO_MESSAGES } from './demoMessages';
import {
  appendOutgoing,
  markConversationRead,
  markMessageStatus,
  unreadTotal,
  type MessageBundle,
} from './messageLogic';
import type { ChatMessage, Conversation } from './messageTypes';

export {
  appendOutgoing,
  markConversationRead,
  markMessageStatus,
  unreadTotal,
};
export type { MessageBundle };

const CONV_KEY = 'taxi_na_biso_chat_conversations';
const MSG_KEY = 'taxi_na_biso_chat_messages';

export async function fetchRemoteConversations(): Promise<MessageBundle | null> {
  // Tables absentes du schéma public généré — pas d’appel inventé.
  void supabase;
  return null;
}

async function readLocal(): Promise<MessageBundle | null> {
  const convRaw = await secureStorage.getItem(CONV_KEY);
  const msgRaw = await secureStorage.getItem(MSG_KEY);
  if (!convRaw || !msgRaw) return null;
  try {
    const conversations = JSON.parse(convRaw) as Conversation[];
    const messages = JSON.parse(msgRaw) as ChatMessage[];
    if (!Array.isArray(conversations) || !Array.isArray(messages)) return null;
    return { conversations, messages };
  } catch {
    return null;
  }
}

export async function writeLocal(bundle: MessageBundle): Promise<void> {
  await secureStorage.setItem(CONV_KEY, JSON.stringify(bundle.conversations));
  await secureStorage.setItem(MSG_KEY, JSON.stringify(bundle.messages.slice(-400)));
}

export async function loadConversations(): Promise<MessageBundle> {
  const remote = await fetchRemoteConversations();
  if (remote && remote.conversations.length > 0) return remote;

  const local = await readLocal();
  if (local && local.conversations.length > 0) return local;

  if (isDevAuthBypass()) {
    const demo = { conversations: DEMO_CONVERSATIONS, messages: DEMO_MESSAGES };
    await writeLocal(demo);
    return demo;
  }

  return { conversations: [], messages: [] };
}
