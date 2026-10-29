import { useLocalSearchParams } from 'expo-router';
import { ReadyRouteGate } from '@/components/itinerary/route-gate';
import { StopScreen } from '@/components/itinerary/stop-screen';

/** One stop of a ready-made route. */
export default function RouteStopScreen() {
  const { position } = useLocalSearchParams<{ position: string }>();

  return (
    <ReadyRouteGate>
      {(_route, itinerary) => <StopScreen itinerary={itinerary} position={Number(position)} />}
    </ReadyRouteGate>
  );
}
