import type { VehicleCategory } from '../../config/brand';

export type ActivityStatus = 'completed' | 'scheduled' | 'cancelled' | 'active';

export type ActivityFilter = 'all' | 'completed' | 'scheduled' | 'cancelled';

export type ActivityRide = {
  id: string;
  pickupLabel: string;
  dropoffLabel: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  occurredAt: string;
  driverName: string | null;
  vehicle: string | null;
  plate: string | null;
  categoryId: VehicleCategory['id'];
  fareCents: number;
  estimated: boolean;
  status: ActivityStatus;
  payment: string;
  reference: string;
  distanceKm: number;
};
