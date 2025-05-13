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

/**
 * Service d'authentification pour la gestion des utilisateurs
 */
export const authService = {
  /**
   * Authentifie un utilisateur avec ses identifiants
   * @param credentials Identifiants de connexion
   */
  login: async (credentials: LoginCredentials) => {
    return apiClient.post<LoginResponse>('/auth/login/', credentials);
  },

  /**
   * Déconnecte l'utilisateur actuel
   */
  logout: async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      return apiClient.post('/logout/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },

  /**
   * Vérifie si un utilisateur est connecté
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const userStr = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return !!userStr;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'authentification:', error);
      return false;
    }
  },

  /**
   * Récupère l'utilisateur actuellement connecté
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userStr = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (userStr) {
        return JSON.parse(userStr) as User;
      }
      return null;
    } catch (e) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', e);
      return null;
    }
  },

  /**
   * Sauvegarde les informations de l'utilisateur et le token
   */
  setUserData: async (userData: LoginResponse, token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données utilisateur:', error);
      throw error;
    }
  },

  /**
   * Récupère le token d'authentification
   */
  getAuthToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }
}; 