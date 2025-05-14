import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, BASE_URL } from '@/constants/Config';

const CSRF_TOKEN_KEY = 'csrf_token';

// Fonction pour obtenir le CSRF token depuis l'API
const fetchCsrfToken = async (): Promise<string | null> => {
  try {
    console.log('Tentative de récupération du token CSRF...');
    // Faire une requête GET vers l'API pour obtenir le token CSRF
    const response = await axios.get(`${BASE_URL}/csrf/`, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': BASE_URL,
      }
    });
    
    console.log('Réponse CSRF reçue:', response.data);
    
    // Le token est directement dans response.data.csrfToken selon la réponse de l'API
    const csrfToken = response.data?.csrfToken;
    
    if (csrfToken) {
      console.log('Token CSRF récupéré avec succès:', csrfToken);
      await AsyncStorage.setItem(CSRF_TOKEN_KEY, csrfToken);
      return csrfToken;
    }
    
    console.error('Aucun token CSRF trouvé dans la réponse');
    return null;
  } catch (error: any) {
    console.error('Erreur détaillée lors de la récupération du CSRF token:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      headers: error?.response?.headers
    });
    return null;
  }
};

const getCsrfToken = async (): Promise<string | null> => {
  try {
    // Essayer d'abord de récupérer le token stocké
    const storedToken = await AsyncStorage.getItem(CSRF_TOKEN_KEY);
    if (storedToken) {
      return storedToken;
    }
    
    // Si pas de token stocké, en récupérer un nouveau
    return await fetchCsrfToken();
  } catch (error) {
    console.error('Erreur lors de la récupération du CSRF token:', error);
    return null;
  }
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Referer': BASE_URL,
  },
  timeout: 10000,
  // Activer withCredentials pour envoyer les cookies de session avec les requêtes cross-origin
  withCredentials: true,
});

// Intercepteur pour ajouter le CSRF token aux requêtes
apiClient.interceptors.request.use(async (config) => {
  console.log('Préparation de la requête:', config.url);
  
  // Ne pas ajouter le token pour la requête de login ou la requête CSRF
  if (config.url?.includes('/auth/login/') || config.url?.includes('/csrf/')) {
    console.log('Requête exclue de la vérification CSRF');
    return config;
  }

  const csrfToken = await getCsrfToken();
  if (csrfToken) {
    console.log('Ajout du token CSRF aux headers');
    // Django attend le token dans le header X-CSRFToken
    config.headers['X-CSRFToken'] = csrfToken;
  } else {
    console.warn('Aucun token CSRF disponible pour la requête');
  }
  
  console.log('Headers de la requête:', config.headers);
  return config;
});

// Intercepteurs pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si erreur CSRF, essayer de récupérer un nouveau token
    if (error.response?.status === 403 && error.response?.data?.detail?.includes('CSRF')) {
      try {
        const newToken = await fetchCsrfToken();
        if (newToken) {
          // Réessayer la requête avec le nouveau token
          error.config.headers['X-CSRFToken'] = newToken;
          return apiClient(error.config);
        }
      } catch (retryError) {
        console.error('Erreur lors de la récupération d\'un nouveau token CSRF:', retryError);
      }
    }
    
    // Log détaillé pour aider au débogage
    console.error('Erreur API:', error);
    
    if (error.response?.status === 401) {
      // Rediriger vers la page de connexion ou rafraîchir le token
      console.log('Session expirée. Veuillez vous reconnecter.');
    }
    return Promise.reject(error);
  }
);

// Initialiser le token CSRF au démarrage et le rafraîchir périodiquement
const initializeCsrf = async () => {
  try {
    const token = await fetchCsrfToken();
    if (!token) {
      console.error('Échec de l\'initialisation du token CSRF');
      return;
    }
    console.log('Token CSRF initialisé avec succès');
    // Rafraîchir le token toutes les 15 minutes (au lieu de 30)
    setInterval(async () => {
      const newToken = await fetchCsrfToken();
      if (newToken) {
        console.log('Token CSRF rafraîchi avec succès');
      }
    }, 15 * 60 * 1000);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du CSRF:', error);
  }
};

initializeCsrf();

export default apiClient; 