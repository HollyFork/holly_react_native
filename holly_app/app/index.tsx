import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { authService } from '@/src/services/auth/authService';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

/**
 * Page d'entrée de l'application
 * Vérifie l'authentification et redirige vers la page appropriée
 */
export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Vérifier l'authentification pour déterminer où rediriger
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await authService.isAuthenticated();
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error('Erreur lors de la vérification d\'authentification:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Afficher un chargement pendant la vérification
  if (isAuthenticated === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.text}>Chargement...</ThemedText>
      </View>
    );
  }
  
  // Rediriger vers le dashboard si authentifié, sinon vers login
  return <Redirect href={isAuthenticated ? "/(tabs)/dashboard" : "/auth/login"} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
  }
}); 