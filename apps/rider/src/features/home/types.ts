import type { VehicleCategory } from '../../config/brand';
import type { Place } from '../../lib/geocode';
import type { DemoAssignedDriver } from './demoDriver';
import type { FareResult } from './calculateFare';

export type HomePhase =
  | 'browse'
  | 'search'
  | 'pick-map'
  | 'vehicles'
  | 'confirm'
  | 'searching'
  | 'assigned'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed';

export type PickMapTarget = 'pickup' | 'dropoff';

export type PaymentMethod = 'cash';

export type DemoTripStatus = 'active' | 'completed' | 'cancelled';

export type DemoTrip = {
  id: string;
  createdAt: string;
  completedAt: string | null;
  pickup: Place;
  dropoff: Place;
  categoryId: VehicleCategory['id'];
  fare: FareResult;
  payment: PaymentMethod;
  status: DemoTripStatus;
  phase: HomePhase;
  driver: DemoAssignedDriver | null;
};

export const TRIP_PHASE_LABEL: Record<HomePhase, string> = {
  browse: 'Prêt à partir',
  search: 'Recherche de destination',
  'pick-map': 'Choix sur la carte',
  vehicles: 'Choix du véhicule',
  confirm: 'Confirmation',
  searching: 'Recherche d’un chauffeur proche…',
  assigned: 'Chauffeur trouvé',
  en_route: 'En route vers vous',
  arrived: 'Chauffeur arrivé',
  in_progress: 'Course en cours',
  completed: 'Arrivée à destination',
};
