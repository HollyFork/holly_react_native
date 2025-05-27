import { User } from '@models/User';
import { authService } from '@services/auth/authService';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Interface pour les identifiants de connexion, si non définie ailleurs
interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>; 
  logout: () => Promise<void>;
  isLoading: boolean; // Pour gérer l'état de chargement initial de l'auth
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fonction pour gérer la déconnexion et la redirection
  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      router.replace('/auth/login');
    } catch (error) {
      console.error("AuthProvider: Erreur lors de la déconnexion", error);
      // Forcer la redirection même en cas d'erreur
      router.replace('/auth/login');
    }
  };

  useEffect(() => {
    const checkAuthState = async () => {
      console.log("AuthProvider: Vérification de l'état d'authentification initial...");
      setIsLoading(true);
      try {
        const authenticated = await authService.isAuthenticated();
        console.log("AuthProvider: isAuthenticated (initial) ->", authenticated);
        
        if (authenticated) {
          const currentUser = await authService.getCurrentUser();
          console.log("AuthProvider: getCurrentUser (initial) ->", currentUser);
          
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            // Si pas d'utilisateur trouvé malgré l'authentification, déconnexion
            await handleLogout();
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          // Rediriger vers login si on n'est pas déjà sur la page de login
          if (!router.canGoBack()) {
            router.replace('/auth/login');
          }
        }
      } catch (e) {
        console.error("AuthProvider: Erreur lors de la vérification de l'état d'auth initial", e);
        await handleLogout();
      } finally {
        setIsLoading(false);
        console.log("AuthProvider: Vérification initiale de l'état d'auth terminée.");
      }
    };
    checkAuthState();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    console.log("AuthProvider: Tentative de connexion...");
    try {
      const response = await authService.login(credentials);
      if (response && response.data) {
        const loggedInUser = await authService.getCurrentUser();
        if (loggedInUser) {
          setUser(loggedInUser);
          setIsAuthenticated(true);
          console.log("AuthProvider: Connexion réussie, utilisateur:", loggedInUser);
          router.replace('/(tabs)/dashboard');
        } else {
          throw new Error("Erreur lors de la récupération des données utilisateur");
        }
      } else {
        throw new Error("Réponse de connexion invalide ou vide");
      }
    } catch (error) {
      console.error("AuthProvider: Erreur de connexion", error);
      await handleLogout();
      throw error;
    }
  };

  const logout = handleLogout;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 