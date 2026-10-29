import type { MapStyleElement } from 'react-native-maps';

/**
 * Google Maps style in the app's palette: sage land, white streets, pale blue
 * water, labels and business pins toned down so the route reads first.
 */
export const MUTED_MAP_STYLE: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#E4E9DF' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6B6A64' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F6F4EF' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }, { color: '#D3E3D6' }],
  },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9C9A92' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#F3EEE2' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#C9DCE3' }] },
];
