import { estimateRideQuote, selectNearestDriver } from './interactor';

export const buildRideModule = () => ({
  estimateRideQuote,
  selectNearestDriver,
});
