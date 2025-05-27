import { API_URL } from '@/constants/Config';
import { BASE_URL } from '@env';
import axios, { AxiosError } from 'axios';
import { router } from 'expo-router';
import { authService } from '../auth/authService';

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
  },
  withCredentials: false, // Désactiver withCredentials car nous utilisons JWT
});

// File d'attente pour les requêtes pendant le rafraîchissement du token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Intercepteur pour ajouter le token JWT aux requêtes
apiClient.interceptors.request.use(async (config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  
  // Ne pas ajouter le token pour les routes d'authentification
  if (config.url?.includes('/auth/login/') || 
      config.url?.includes('/auth/register/') || 
      config.url?.includes('/auth/token/refresh/')) {
    console.log('[API Request] Route d\'authentification - Pas de token nécessaire');
    return config;
  }

  try {
    const token = await authService.getAuthToken();
    if (token) {
      // Vérification basique de la structure du token
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expirationTime = payload.exp * 1000; // Convertir en millisecondes
          
          if (Date.now() >= expirationTime) {
            console.log('[API Request] Token expiré, tentative de rafraîchissement');
            const newToken = await authService.refreshAccessToken();
            if (newToken) {
              config.headers.Authorization = `Bearer ${newToken}`;
              console.log('[API Request] Nouveau token appliqué');
            } else {
              throw new Error('Impossible de rafraîchir le token');
            }
          } else {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[API Request] Token valide appliqué');
          }
        } catch (e) {
          console.error('[API Request] Erreur lors de la vérification du token:', e);
          throw new Error('Token invalide');
        }
      } else {
        console.error('[API Request] Format de token invalide');
        throw new Error('Format de token invalide');
      }
    } else {
      console.log('[API Request] Aucun token disponible');
    }
  } catch (error) {
    console.error('[API Request] Erreur lors de la gestion du token:', error);
    throw error;
  }
  
  return config;
}, (error) => {
  console.error('[API Request] Erreur dans l\'intercepteur de requête:', error);
  return Promise.reject(error);
});

// Intercepteur pour gérer les erreurs et le rafraîchissement du token
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Si l'erreur est 401 et que ce n'est pas une tentative de rafraîchissement
    if (error.response?.status === 401 && 
        !originalRequest.url?.includes('/auth/token/refresh/')) {
      
      if (isRefreshing) {
        // Si un rafraîchissement est déjà en cours, mettre la requête en file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;
      
      try {
        console.log('[API Response] Tentative de rafraîchissement du token');
        const newToken = await authService.refreshAccessToken();
        
        if (newToken) {
          console.log('[API Response] Token rafraîchi avec succès');
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('Échec du rafraîchissement du token');
        }
      } catch (refreshError) {
        console.error('[API Response] Erreur lors du rafraîchissement:', refreshError);
        processQueue(refreshError, null);
        await authService.logout();
        router.replace('/auth/login');
        return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
      } finally {
        isRefreshing = false;
      }
    }
    
    // Gestion des autres erreurs d'authentification
    if (error.response?.status === 401 || 
        error.response?.status === 403 || 
        (error.response?.data as any)?.detail === 'Token invalide') {
      console.error('[API Response] Erreur d\'authentification:', error.response?.data);
      await authService.logout();
      router.replace('/auth/login');
      return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 