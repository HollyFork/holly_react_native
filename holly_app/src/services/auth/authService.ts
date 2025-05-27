import { User } from '@/models/User';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../utils/api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse extends User {
  id_user: number; // Garder l'ID original de l'API
  access_token: string;
  refresh_token: string;
}

// Clés de stockage
const USER_STORAGE_KEY = 'user_data';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

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
    try {
      // Effectuer la requête de connexion
      console.log('Tentative de connexion avec les identifiants fournis...');
      const response = await apiClient.post<LoginResponse>('/auth/login/', credentials);
      
      // Stocker les données en mémoire et dans AsyncStorage
      if (response.data) {
        const userData = {
          ...response.data,
          id: response.data.id_user // Assurer la compatibilité avec l'interface User
        };
        currentUserData = userData;
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, response.data.access_token);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh_token);
      }
      return response;
    } catch (error) {
      console.error('Erreur lors de la tentative de connexion:', error);
      throw error;
    }
  },

  /**
   * Déconnecte l'utilisateur actuel
   */
  logout: async () => {
    try {
      // Supprimer les données en mémoire
      currentUserData = null;
      // Supprimer les données stockées
      await AsyncStorage.multiRemove([
        USER_STORAGE_KEY,
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY
      ]);
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
    try {
      // Vérifier d'abord en mémoire
      if (currentUserData) return true;
      
      // Si pas en mémoire, vérifier dans AsyncStorage
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        currentUserData = JSON.parse(storedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      return false;
    }
  },

  isAuthenticatedBis: async (): Promise<boolean> => {
    try {
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      return false;
    }
  },
      
  /**
   * Récupère l'utilisateur actuellement connecté
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Vérifier d'abord en mémoire
      if (currentUserData) return currentUserData as User;
      
      // Si pas en mémoire, récupérer depuis AsyncStorage
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        currentUserData = JSON.parse(storedUser);
        return currentUserData as User;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  },

  /**
   * Sauvegarde les informations de l'utilisateur et le token
   */
  setUserData: async (userData: LoginResponse, token: string): Promise<void> => {
    try {
      const userDataWithId = {
        ...userData,
        id: userData.id_user // Assurer la compatibilité avec l'interface User
      };
      currentUserData = userDataWithId;
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userDataWithId));
      if (token) {
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
      }
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
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  },

  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Erreur lors de la récupération du refresh token:', error);
      return null;
    }
  },

  refreshAccessToken: async (): Promise<string | null> => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }

      const response = await apiClient.post('/auth/token/refresh/', {
        refresh: refreshToken
      });

      const newAccessToken = response.data.access;
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      await authService.logout(); // Déconnexion en cas d'échec
      return null;
    }
  }
}; 