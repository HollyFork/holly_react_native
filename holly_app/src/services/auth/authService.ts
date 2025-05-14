import apiClient from '../api';
import { User } from '@/src/models';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  id_user: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

// Clés de stockage
const USER_STORAGE_KEY = 'user_data';
const TOKEN_STORAGE_KEY = 'auth_token';

// Variable pour stocker temporairement les données de l'utilisateur
let currentUserData: LoginResponse | null = null;

/**
 * Service d'authentification pour la gestion des utilisateurs
 */
export const authService = {
  /**
   * Authentifie un utilisateur avec ses identifiants
   * @param credentials Identifiants de connexion
   */
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<LoginResponse>('/auth/login/', credentials);
    // Stocker les données temporairement en mémoire
    if (response.data) {
      currentUserData = response.data;
    }
    return response;
  },

  /**
   * Déconnecte l'utilisateur actuel
   */
  logout: async () => {
    try {
      // Supprimer les données en mémoire
      currentUserData = null;
      // Supprimer les données stockées
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      return Promise.resolve();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return Promise.resolve();
    }
  },

  /**
   * Vérifie si un utilisateur est connecté
   */
  isAuthenticated: async (): Promise<boolean> => {
    // Vérifier si nous avons des données utilisateur en mémoire
    return !!currentUserData;
  },

  /**
   * Récupère l'utilisateur actuellement connecté
   */
  getCurrentUser: async (): Promise<User | null> => {
    // Retourner les données utilisateur en mémoire
    return currentUserData as User | null;
  },

  /**
   * Sauvegarde les informations de l'utilisateur et le token
   */
  setUserData: async (userData: LoginResponse, token: string): Promise<void> => {
    // Stocker les données en mémoire
    currentUserData = userData;
    return Promise.resolve();
  },

  /**
   * Récupère le token d'authentification
   */
  getAuthToken: async (): Promise<string | null> => {
    // Retourner le token si l'utilisateur est connecté
    return currentUserData ? 'session_active' : null;
  }
}; 