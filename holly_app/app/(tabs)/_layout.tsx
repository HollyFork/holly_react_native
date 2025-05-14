import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
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
    </Tabs>
  );
}
