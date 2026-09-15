import { create } from 'zustand';

import type { ActivityRide } from './activityTypes';

type State = {
  rides: ActivityRide[];
  setRides: (rides: ActivityRide[]) => void;
};

export const useActivityStore = create<State>((set) => ({
  rides: [],
  setRides: (rides) => set({ rides }),
}));
