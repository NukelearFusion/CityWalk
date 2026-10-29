import { Children, type ReactNode } from 'react';
import { View } from 'react-native';

export interface GridProps {
  children: ReactNode;
  /** Columns on this screen; 1 stacks the items. */
  columns: number;
  gap: number;
}

/**
 * Equal-width card grid. Multi-column layouts only occur on the web, where
 * CSS `calc()` is available, so the widths are expressed with it.
 */
export function Grid({ children, columns, gap }: GridProps) {
  const items = Children.toArray(children);

  if (columns <= 1) {
    return <View style={{ gap }}>{items}</View>;
  }

  const width = `calc(${100 / columns}% - ${(gap * (columns - 1)) / columns}px)`;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {items.map((item, index) => (
        // Positional keys are fine: the children carry their own keys inside.
        <View key={index} style={{ width: width as unknown as number }}>
          {item}
        </View>
      ))}
    </View>
  );
}
