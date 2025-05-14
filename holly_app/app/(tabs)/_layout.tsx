import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/src/services/auth/authService';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        if (!isAuthenticated) {
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('Erreur de vérification d\'authentification:', error);
        router.replace('/auth/login');
      } finally {
        setIsAuthChecked(true);
      }
    };
    
    checkAuth();
  }, []);
  
  if (!isAuthChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
        animation: 'none',
      }}
      initialRouteName="dashboard"
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
    </Tabs>
  );
}
