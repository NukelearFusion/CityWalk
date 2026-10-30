import { MapScreen } from '@/components/itinerary/map-screen';
import { PlannedRouteGate } from '@/components/plan/planned-route';

/** Walking the planned route on the map. */
export default function PlannedRouteMapScreen() {
  return (
    <PlannedRouteGate>{(_plan, itinerary) => <MapScreen itinerary={itinerary} />}</PlannedRouteGate>
  );
}
