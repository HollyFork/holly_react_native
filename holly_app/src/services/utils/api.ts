import { API_URL, BASE_URL } from '@/constants/Config';
import axios from 'axios';

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
      }
    });
    
    console.log('Réponse CSRF reçue:', response.data);
    
    // Le token est directement dans response.data.csrfToken selon la réponse de l'API
    const csrfToken = response.data?.csrfToken;
    
    if (csrfToken) {
      console.log('Token CSRF récupéré avec succès:', csrfToken);
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

console.log(`Configuration API client avec URL: ${API_URL}`);
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Referer': BASE_URL,
  },
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
  const csrfToken = await fetchCsrfToken();
  if (csrfToken) {
    console.log('Ajout du token CSRF aux headers');
    // Django attend le token dans le header X-CSRFToken
    config.headers['X-CSRFToken'] = csrfToken;
  } else {
    console.warn('Erreur Récupération CSRF Token');
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

export default apiClient; 