import { create } from 'zustand';

export type MainTab = 'home' | 'activity' | 'safety' | 'messages' | 'account';

export type ShellScreen =
  | { id: 'notifications' }
  | { id: 'tripDetail'; tripId: string }
  | { id: 'conversation'; conversationId: string }
  | { id: 'trustedContacts' }
  | { id: 'safetyTips' }
  | { id: 'report' }
  | { id: 'verifyDriver' }
  | { id: 'savedPlaces' }
  | { id: 'scheduledRides' }
  | { id: 'payments' }
  | { id: 'help' }
  | { id: 'about' }
  | { id: 'editProfile' }
  | { id: 'deleteAccount' }
  | { id: 'language' }
  | { id: 'appearance' }
  | { id: 'permissions' }
  | { id: 'legal'; kind: 'terms' | 'privacy' };

type ShellState = {
  tab: MainTab;
  stack: ShellScreen[];
  setTab: (tab: MainTab) => void;
  push: (screen: ShellScreen) => void;
  pop: () => void;
  resetOverlay: () => void;
};

export const useShellStore = create<ShellState>((set) => ({
  tab: 'home',
  stack: [],
  setTab: (tab) => set({ tab, stack: [] }),
  push: (screen) => set((state) => ({ stack: [...state.stack, screen] })),
  pop: () => set((state) => ({ stack: state.stack.slice(0, -1) })),
  resetOverlay: () => set({ stack: [] }),
}));
