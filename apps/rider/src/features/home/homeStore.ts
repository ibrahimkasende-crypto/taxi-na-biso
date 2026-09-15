import { create } from 'zustand';

import { examplePlaces, type VehicleCategory } from '../../config/brand';
import type { Place } from '../../lib/geocode';
import { fareForTrip, type FareResult } from './calculateFare';
import { DEMO_ASSIGNED_DRIVER } from './demoDriver';
import { writeDemoTrips } from './demoTrips';
import type { DemoTrip, HomePhase, PaymentMethod, PickMapTarget } from './types';

type FavoriteKey = 'home' | 'work';

type HomeState = {
  phase: HomePhase;
  pickup: Place | null;
  dropoff: Place | null;
  pickTarget: PickMapTarget;
  categoryId: VehicleCategory['id'];
  fare: FareResult | null;
  payment: PaymentMethod;
  recentPlaces: Place[];
  favorites: Record<FavoriteKey, Place | null>;
  activeTrip: DemoTrip | null;
  trips: DemoTrip[];
  notifications: number;
  offline: boolean;
  setPickup: (place: Place | null) => void;
  setDropoff: (place: Place | null) => void;
  setPhase: (phase: HomePhase) => void;
  setCategory: (id: VehicleCategory['id']) => void;
  setPayment: (method: PaymentMethod) => void;
  setOffline: (offline: boolean) => void;
  openSearch: () => void;
  openPickMap: (target: PickMapTarget) => void;
  selectDestination: (place: Place) => void;
  hydrateTrips: (trips: DemoTrip[]) => void;
  saveFavorite: (key: FavoriteKey, place: Place) => void;
  requestRide: () => DemoTrip | null;
  advanceTrip: (phase: HomePhase) => void;
  cancelRide: () => void;
  resetBooking: () => void;
};

function withFare(pickup: Place | null, dropoff: Place | null, categoryId: VehicleCategory['id']): FareResult | null {
  if (!pickup || !dropoff) return null;
  return fareForTrip(pickup, dropoff, categoryId);
}

function rememberPlace(list: Place[], place: Place): Place[] {
  const next = [place, ...list.filter((item) => item.label !== place.label)];
  return next.slice(0, 6);
}

export const useHomeStore = create<HomeState>((set, get) => ({
  phase: 'browse',
  pickup: null,
  dropoff: null,
  pickTarget: 'dropoff',
  categoryId: 'economy',
  fare: null,
  payment: 'cash',
  recentPlaces: [...examplePlaces],
  favorites: { home: null, work: null },
  activeTrip: null,
  trips: [],
  notifications: 0,
  offline: false,

  setPickup: (place) =>
    set((state) => ({
      pickup: place,
      fare: withFare(place, state.dropoff, state.categoryId),
    })),

  setDropoff: (place) =>
    set((state) => ({
      dropoff: place,
      fare: withFare(state.pickup, place, state.categoryId),
    })),

  setPhase: (phase) => set({ phase }),

  setCategory: (categoryId) =>
    set((state) => ({
      categoryId,
      fare: withFare(state.pickup, state.dropoff, categoryId),
    })),

  setPayment: (_method) => set({ payment: 'cash' }),
  setOffline: (offline) => set({ offline }),

  openSearch: () => set({ phase: 'search' }),

  openPickMap: (target) => set({ phase: 'pick-map', pickTarget: target }),

  selectDestination: (place) =>
    set((state) => ({
      dropoff: place,
      fare: withFare(state.pickup, place, state.categoryId),
      recentPlaces: rememberPlace(state.recentPlaces, place),
      phase: state.pickup ? 'vehicles' : 'search',
    })),

  hydrateTrips: (trips) =>
    set({
      trips,
      activeTrip: trips.find((trip) => trip.status === 'active') ?? null,
    }),

  saveFavorite: (key, place) =>
    set((state) => ({
      favorites: { ...state.favorites, [key]: place },
    })),

  requestRide: () => {
    const state = get();
    if (!state.pickup || !state.dropoff || !state.fare) return null;
    const trip: DemoTrip = {
      id: `demo-trip-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completedAt: null,
      pickup: state.pickup,
      dropoff: state.dropoff,
      categoryId: state.categoryId,
      fare: state.fare,
      payment: state.payment,
      status: 'active',
      phase: 'searching',
      driver: null,
    };
    const trips = [trip, ...state.trips.filter((item) => item.id !== trip.id)];
    void writeDemoTrips(trips);
    set({ activeTrip: trip, trips, phase: 'searching' });
    return trip;
  },

  advanceTrip: (phase) => {
    const state = get();
    if (!state.activeTrip) {
      set({ phase });
      return;
    }
    const completed = phase === 'completed';
    const next: DemoTrip = {
      ...state.activeTrip,
      phase,
      status: completed ? 'completed' : 'active',
      completedAt: completed ? new Date().toISOString() : state.activeTrip.completedAt,
      driver: phase === 'searching' ? null : (state.activeTrip.driver ?? DEMO_ASSIGNED_DRIVER),
    };
    const trips = [next, ...state.trips.filter((item) => item.id !== next.id)];
    void writeDemoTrips(trips);
    set({
      activeTrip: completed ? null : next,
      trips,
      phase,
    });
  },

  cancelRide: () => {
    const state = get();
    if (!state.activeTrip) {
      set({ phase: state.dropoff ? 'vehicles' : 'browse' });
      return;
    }
    const cancelled: DemoTrip = { ...state.activeTrip, status: 'cancelled', phase: 'browse' };
    const trips = [cancelled, ...state.trips.filter((item) => item.id !== cancelled.id)];
    void writeDemoTrips(trips);
    set({
      activeTrip: null,
      trips,
      phase: 'browse',
    });
  },

  resetBooking: () =>
    set((state) => ({
      dropoff: null,
      fare: null,
      phase: 'browse',
      activeTrip: null,
      categoryId: 'economy',
      pickup: state.pickup,
    })),
}));
