import { create } from 'zustand';

import { isDevAuthBypass } from '../auth/demo/demoAuthEnabled';
import { DEMO_NOTIFICATIONS } from './demoNotifications';
import type { RiderNotification } from './types';

type State = {
  items: RiderNotification[];
  hydrated: boolean;
  hydrate: (real: RiderNotification[]) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
};

export function unreadCount(items: RiderNotification[]): number {
  return items.filter((item) => !item.read).length;
}

export const useNotificationStore = create<State>((set, get) => ({
  items: [],
  hydrated: false,
  hydrate: (real) => {
    if (real.length > 0) {
      set({ items: real, hydrated: true });
      return;
    }
    set({
      items: isDevAuthBypass() ? DEMO_NOTIFICATIONS : [],
      hydrated: true,
    });
  },
  markAllRead: () =>
    set({
      items: get().items.map((item) => ({ ...item, read: true })),
    }),
  markRead: (id) =>
    set({
      items: get().items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    }),
}));
