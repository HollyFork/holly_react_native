import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, BASE_URL } from '@/constants/Config';

const CSRF_TOKEN_KEY = 'csrf_token';

// Fonction pour obtenir le CSRF token depuis l'API
const fetchCsrfToken = async (): Promise<string | null> => {
  try {
    console.log(`Tentative de récupération du token CSRF... URL: ${BASE_URL}/csrf/`);
    // Faire une requête GET vers l'API pour obtenir le token CSRF
    const response = await axios.get(`${BASE_URL}/csrf/`, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Referer': BASE_URL,
      },
      timeout: 15000, // Augmenter le timeout pour cette requête importante
    });
    
    console.log('Réponse CSRF reçue:', response.data);
    
    // Le token est directement dans response.data.csrfToken selon la réponse de l'API
    const csrfToken = response.data?.csrfToken;
    
    if (csrfToken) {
      console.log('Token CSRF récupéré avec succès:', csrfToken);
      await AsyncStorage.setItem(CSRF_TOKEN_KEY, csrfToken);
      return csrfToken;
    }
    
    console.error('Aucun token CSRF trouvé dans la réponse. Données reçues:', response.data);
    return null;
  } catch (error: any) {
    console.error('Erreur détaillée lors de la récupération du CSRF token:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      headers: error?.response?.headers,
      baseURL: BASE_URL
    });
    return null;
  }
};

const getCsrfToken = async (): Promise<string | null> => {
  try {
    // Essayer d'abord de récupérer le token stocké
    const storedToken = await AsyncStorage.getItem(CSRF_TOKEN_KEY);
    if (storedToken) {
      console.log('Token CSRF récupéré depuis le stockage local');
      return storedToken;
    }
    
    console.log('Aucun token CSRF en cache, tentative de récupération depuis le serveur');
    // Si pas de token stocké, en récupérer un nouveau
    return await fetchCsrfToken();
  } catch (error) {
    console.error('Erreur lors de la récupération du CSRF token:', error);
    return null;
  }
};

console.log(`Configuration API client avec URL: ${API_URL}`);
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Referer': BASE_URL,
  },
  timeout: 15000, // Augmenter le timeout pour toutes les requêtes
  // Activer withCredentials pour envoyer les cookies de session avec les requêtes cross-origin
  withCredentials: true,
});

// Intercepteur pour ajouter le CSRF token aux requêtes
apiClient.interceptors.request.use(async (config) => {
  console.log(`Préparation de la requête: ${config.method?.toUpperCase()} ${config.url}`);
  
  // Ne pas ajouter le token uniquement pour la requête CSRF
  if (config.url?.includes('/csrf/')) {
    console.log('Requête CSRF exclue de la vérification CSRF');
    return config;
  }

  // Ajouter le token CSRF pour toutes les autres requêtes, y compris login
  const csrfToken = await getCsrfToken();
  if (csrfToken) {
    console.log('Ajout du token CSRF aux headers');
    // Django attend le token dans le header X-CSRFToken
    config.headers['X-CSRFToken'] = csrfToken;
  } else {
    console.warn('Aucun token CSRF disponible pour la requête. Tentative de réinitialisation...');
    // Essayer de réinitialiser le token en cas d'absence
    setTimeout(() => {
      initializeCsrf().catch(err => console.error('Échec de réinitialisation du CSRF:', err));
    }, 0);
  }
  
  console.log('Headers de la requête:', JSON.stringify(config.headers));
  return config;
}, (error) => {
  console.error('Erreur dans l\'intercepteur de requête:', error);
  return Promise.reject(error);
});

// Intercepteurs pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Réponse reçue: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    console.error(`Erreur API: ${error?.config?.method?.toUpperCase()} ${error?.config?.url} - ${error.message}`);
    
    // Si erreur CSRF, essayer de récupérer un nouveau token
    if (error.response?.status === 403 && error.response?.data?.detail?.includes('CSRF')) {
      console.log('Erreur CSRF détectée, tentative de récupération d\'un nouveau token');
      try {
        await AsyncStorage.removeItem(CSRF_TOKEN_KEY); // Forcer la récupération d'un nouveau token
        const newToken = await fetchCsrfToken();
        if (newToken) {
          console.log('Nouveau token CSRF obtenu, réessai de la requête');
          // Réessayer la requête avec le nouveau token
          error.config.headers['X-CSRFToken'] = newToken;
          return apiClient(error.config);
        }
      } catch (retryError) {
        console.error('Erreur lors de la récupération d\'un nouveau token CSRF:', retryError);
      }
    }
    
    // Log détaillé pour aider au débogage
    console.error('Détails de l\'erreur API:', {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error.message
    });
    
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
    console.log('Initialisation du token CSRF...');
    const token = await fetchCsrfToken();
    if (!token) {
      console.error('Échec de l\'initialisation du token CSRF');
      // Réessayer après un court délai
      setTimeout(() => {
        console.log('Nouvelle tentative d\'initialisation du token CSRF...');
        fetchCsrfToken();
      }, 5000);
      return;
    }
    console.log('Token CSRF initialisé avec succès');
    // Rafraîchir le token toutes les 15 minutes (au lieu de 30)
    setInterval(async () => {
      console.log('Rafraîchissement périodique du token CSRF...');
      const newToken = await fetchCsrfToken();
      if (newToken) {
        console.log('Token CSRF rafraîchi avec succès');
      } else {
        console.error('Échec du rafraîchissement du token CSRF');
      }
    }, 15 * 60 * 1000);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du CSRF:', error);
  }
};

// Exporter une fonction pour réinitialiser manuellement le token CSRF
export const resetCsrfToken = async () => {
  console.log('Réinitialisation manuelle du token CSRF');
  await AsyncStorage.removeItem(CSRF_TOKEN_KEY);
  return fetchCsrfToken();
};

console.log('Initialisation du service API...');
initializeCsrf();

export default apiClient; 