import { Stack } from 'expo-router';
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
  
  // Vérifier l'authentification une seule fois au chargement du layout
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        if (!isAuthenticated) {
          // Rediriger vers login si non authentifié
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
  
  // Afficher un chargement pendant la vérification d'authentification
  if (!isAuthChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{
      headerShown: false,
    }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="index" />
      <Stack.Screen name="explore" />
    </Stack>
  );
}
