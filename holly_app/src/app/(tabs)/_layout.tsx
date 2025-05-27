import ThemedView from '@/components/common/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Tabs } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  const { colors, isDark } = useThemeColor();

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          animation: 'none',
        }}
      >
        <Tabs.Screen 
          name="dashboard"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="salles"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="explore"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="reservations"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="commandes"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="stocks"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="articles"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="notes"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </ThemedView>
  );
}
