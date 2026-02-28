import { Coordinates, DriverInfo, RideQuote } from './types';

const DRIVERS: DriverInfo[] = [
  { id: 'drv-01', name: 'Jailson', vehicle: 'Honda CG 160', rating: 4.9, etaMinutes: 3 },
  { id: 'drv-02', name: 'Carla', vehicle: 'Yamaha Factor', rating: 4.8, etaMinutes: 4 },
  { id: 'drv-03', name: 'Rafa', vehicle: 'Honda Biz', rating: 4.7, etaMinutes: 5 },
];

const toRad = (value: number) => (value * Math.PI) / 180;

const haversineKm = (origin: Coordinates, destination: Coordinates) => {
  const earthRadiusKm = 6371;
  const deltaLat = toRad(destination.lat - origin.lat);
  const deltaLng = toRad(destination.lng - origin.lng);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const estimateRideQuote = (origin: Coordinates, destination: Coordinates): RideQuote => {
  const distanceKm = Math.max(1, Number(haversineKm(origin, destination).toFixed(1)));
  const etaMinutes = Math.max(4, Math.round(distanceKm * 2.8));
  const amount = Math.max(12, Number((6 + distanceKm * 2.2 + etaMinutes * 0.35).toFixed(2)));

  return { distanceKm, etaMinutes, amount };
};

export const selectNearestDriver = () => {
  const index = Math.floor(Math.random() * DRIVERS.length);
  return DRIVERS[index];
};
