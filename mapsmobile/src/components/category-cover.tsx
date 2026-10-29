import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { RouteCategory } from '@/types/domain';

/**
 * Visual identity per category: a gradient and an icon.
 * Routes without a photograph still get a distinctive, on-brand cover, so lists
 * never look broken while the image library is being filled in.
 */
const CATEGORY_STYLE: Record<
  RouteCategory,
  { colors: readonly [string, string]; icon: keyof typeof Ionicons.glyphMap }
> = {
  HISTORICAL: { colors: ['#8B5E34', '#C89B6A'], icon: 'library-outline' },
  NATURE: { colors: ['#1F7A5A', '#5FBF8E'], icon: 'leaf-outline' },
  ARCHITECTURE: { colors: ['#3B5C7E', '#7FA6C9'], icon: 'business-outline' },
  CULTURE: { colors: ['#6B4A8C', '#A98BC4'], icon: 'color-palette-outline' },
  FOOD: { colors: ['#B5502F', '#E4996B'], icon: 'restaurant-outline' },
};

export interface CategoryCoverProps {
  category: RouteCategory;
  /** Photograph to show instead of the gradient, when one is available. */
  imageUrl?: string | null;
  height: number;
  /** Corner radii, matched to the containing card. */
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function CategoryCover({
  category,
  imageUrl,
  height,
  borderRadius = 0,
  style,
  children,
}: CategoryCoverProps) {
  const { colors, icon } = CATEGORY_STYLE[category];

  return (
    <View style={[{ height, borderRadius, overflow: 'hidden' }, style]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={180}
          accessible={false}
        />
      ) : (
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name={icon} size={Math.min(44, height * 0.34)} color="rgba(255,255,255,0.55)" />
        </LinearGradient>
      )}
      {children}
    </View>
  );
}

export function categoryIcon(category: RouteCategory): keyof typeof Ionicons.glyphMap {
  return CATEGORY_STYLE[category].icon;
}
