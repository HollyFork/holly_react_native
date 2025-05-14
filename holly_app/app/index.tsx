import { Redirect } from 'expo-router';
import React from 'react';

/**
 * Page d'entrée de l'application
 * Redirige toujours vers la page de connexion
 */
export default function Index() {
  // Rediriger directement vers la page de connexion
  return <Redirect href="/auth/login" />;
} 