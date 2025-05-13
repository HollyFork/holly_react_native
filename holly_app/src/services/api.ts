import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Utiliser l'adresse IP appropriée selon la plateforme
// 10.0.2.2 est l'équivalent de localhost pour l'émulateur Android
// localhost fonctionne pour l'émulateur iOS
const BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8000/api'
  : 'http://localhost:8000/api';

console.log('API URL configurée:', BASE_URL);

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  // Activer withCredentials pour envoyer les cookies de session avec les requêtes cross-origin
  withCredentials: true,
});

// Intercepteurs pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log détaillé pour aider au débogage
    console.error('Erreur API:', error);
    
    if (error.response?.status === 401) {
      // Rediriger vers la page de connexion ou rafraîchir le token
      console.log('Session expirée. Veuillez vous reconnecter.');
    }
    return Promise.reject(error);
  }
);

export default apiClient; 