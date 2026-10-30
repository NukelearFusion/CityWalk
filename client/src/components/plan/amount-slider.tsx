import { useRef, useState } from 'react';
import { View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import { useTheme } from '@/theme';

export interface AmountSliderProps {
  value: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  accessibilityLabel: string;
}

const THUMB = 26;

/**
 * Single-value slider built on the responder system, which works the same for
 * a finger on a phone and a mouse in the browser — no native module needed.
 * Arrow keys / the accessibility increment action move it by one step.
 */
export function AmountSlider({
  value,
  max,
  step = 5,
  onChange,
  accessibilityLabel,
}: AmountSliderProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const originRef = useRef(0);

  const clamp = (raw: number) => Math.min(max, Math.max(0, Math.round(raw / step) * step));
  const fromX = (x: number) => (width > 0 ? clamp((x / width) * max) : value);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const onGrant = (event: GestureResponderEvent) => {
    // locationX is relative to whichever child was hit; pageX is not.
    originRef.current = event.nativeEvent.pageX - event.nativeEvent.locationX;
    onChange(fromX(event.nativeEvent.locationX));
  };
  const onMove = (event: GestureResponderEvent) =>
    onChange(fromX(event.nativeEvent.pageX - originRef.current));

  const ratio = max > 0 ? value / max : 0;

  return (
    <View
      onLayout={onLayout}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={onGrant}
      onResponderMove={onMove}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) =>
        onChange(clamp(value + (event.nativeEvent.actionName === 'increment' ? step : -step)))
      }
      style={{ height: THUMB + 12, justifyContent: 'center' }}
    >
      <View style={{ height: 4, borderRadius: 2, backgroundColor: theme.colors.border }}>
        <View
          style={{
            width: `${ratio * 100}%`,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.accent,
          }}
        />
      </View>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: Math.max(0, ratio * width - THUMB / 2),
          width: THUMB,
          height: THUMB,
          borderRadius: THUMB / 2,
          backgroundColor: theme.colors.cta,
          borderWidth: 3,
          borderColor: theme.colors.surface,
          ...theme.elevation.card,
        }}
      />
    </View>
  );
}
