import { MapScreen } from '@/components/itinerary/map-screen';
import { ReadyRouteGate } from '@/components/itinerary/route-gate';

/** Walking a ready-made route on the map. */
export default function RouteMapScreen() {
  return (
    <ReadyRouteGate>{(_route, itinerary) => <MapScreen itinerary={itinerary} />}</ReadyRouteGate>
  );
}
