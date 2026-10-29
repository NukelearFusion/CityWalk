import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { NavIcon as NavIconName } from './nav-items';

export interface NavIconProps {
  name: NavIconName;
  color: string;
  size?: number;
  active?: boolean;
}

/** Tab icons from the mockup: house, compass, winding path, bookmark. */
export function NavIcon({ name, color, size = 24, active = false }: NavIconProps) {
  switch (name) {
    case 'home':
      return <Ionicons name={active ? 'home' : 'home-outline'} size={size} color={color} />;
    case 'explore':
      return <Ionicons name={active ? 'compass' : 'compass-outline'} size={size} color={color} />;
    case 'route':
      return <MaterialCommunityIcons name="map-marker-path" size={size} color={color} />;
    case 'saved':
      return <Ionicons name={active ? 'bookmark' : 'bookmark-outline'} size={size} color={color} />;
  }
}
