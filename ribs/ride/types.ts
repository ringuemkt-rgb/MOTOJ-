export type RideStatus =
  | 'idle'
  | 'searching'
  | 'driver_assigned'
  | 'driver_arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RideQuote {
  distanceKm: number;
  etaMinutes: number;
  amount: number;
}

export interface DriverInfo {
  id: string;
  name: string;
  vehicle: string;
  rating: number;
  etaMinutes: number;
}
