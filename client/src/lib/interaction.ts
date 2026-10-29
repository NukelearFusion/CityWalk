import type { PressableStateCallbackType } from 'react-native';

/**
 * Whether a pointer hovers the pressable.
 *
 * React Native Web adds `hovered` to the state object, the native type does
 * not declare it. Touch screens never report it, so hover styling stays a
 * mouse-only enhancement — the same rule Apex applies with `(hover: hover)`.
 */
export function isHovered(state: PressableStateCallbackType): boolean {
  return (state as PressableStateCallbackType & { hovered?: boolean }).hovered === true;
}
