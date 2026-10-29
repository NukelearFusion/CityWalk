import { Tabs } from 'expo-router';
import { TabBar } from '@/components/layout/tab-bar';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="my-route" />
      <Tabs.Screen name="saved" />
    </Tabs>
  );
}
