import type { TileTone } from '@/theme';
import type { RouteCategory } from '@/types/domain';

/** Tile colour for a ready-made route, by its theme. */
const ROUTE_TONE: Record<RouteCategory, TileTone> = {
  HISTORICAL: 'sage',
  ARCHITECTURE: 'stone',
  CULTURE: 'sand',
  FOOD: 'blush',
  NATURE: 'mint',
};

export function routeTone(category: RouteCategory): TileTone {
  return ROUTE_TONE[category];
}

/** Stable tone for a city, so the same city always gets the same tile. */
export function cityTone(slug: string): TileTone {
  const tones: TileTone[] = ['sage', 'blush', 'sand', 'stone', 'mint'];
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return tones[hash % tones.length] ?? 'sage';
}
