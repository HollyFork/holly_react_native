import { BASE_URL } from '@env';

// Vérification immédiate de BASE_URL
if (!BASE_URL) {
  throw new Error('BASE_URL n\'est pas défini dans le fichier .env');
}

console.log('BASE_URL', BASE_URL);

// Fonction d'initialisation pour s'assurer que BASE_URL est chargé
const initializeConfig = () => {
  if (!BASE_URL) {
    throw new Error('Configuration invalide: BASE_URL manquant');
  }
  return {
    API_URL: `${BASE_URL}/api`,
    DEFAULT_HEADERS: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': BASE_URL,
      'Origin': BASE_URL,
    } as const,
  };
};

// Initialisation de la configuration
const config = initializeConfig();

// Export des constantes
export const API_URL = config.API_URL;
export const DEFAULT_HEADERS = config.DEFAULT_HEADERS;

// Vérification supplémentaire lors de l'import
console.log('Configuration initialisée avec API_URL:', API_URL); 