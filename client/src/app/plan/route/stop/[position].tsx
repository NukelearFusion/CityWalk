import { useLocalSearchParams } from 'expo-router';
import { StopScreen } from '@/components/itinerary/stop-screen';
import { PlannedRouteGate } from '@/components/plan/planned-route';

/** One stop of the planned route, with the note on why it was picked. */
export default function PlannedRouteStopScreen() {
  const { position } = useLocalSearchParams<{ position: string }>();

  return (
    <PlannedRouteGate>
      {(_plan, itinerary) => <StopScreen itinerary={itinerary} position={Number(position)} />}
    </PlannedRouteGate>
  );
}
