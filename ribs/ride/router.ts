import { RideStatus } from './types';

export const rideStatusLabel: Record<RideStatus, string> = {
  idle: 'Pronto para solicitar',
  searching: 'Buscando motorista...',
  driver_assigned: 'Motorista confirmado',
  driver_arriving: 'Motorista a caminho',
  in_progress: 'Corrida em andamento',
  completed: 'Corrida finalizada',
  cancelled: 'Corrida cancelada',
};

export const rideStatusTone: Record<RideStatus, string> = {
  idle: 'text-white/80',
  searching: 'text-gold',
  driver_assigned: 'text-success',
  driver_arriving: 'text-success',
  in_progress: 'text-gold',
  completed: 'text-success',
  cancelled: 'text-danger',
};
