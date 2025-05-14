import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../src/services/auth/authService'; // Ajustez le chemin si nécessaire
import { User } from '../src/models'; // Ajustez le chemin si nécessaire

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
  const [isLoading, setIsLoading] = useState<boolean>(true); // True au début pour vérifier l'état initial

  useEffect(() => {
    const checkAuthState = async () => {
      console.log("AuthProvider: Vérification de l'état d'authentification initial...");
      setIsLoading(true);
      try {
        const authenticated = await authService.isAuthenticated();
        console.log("AuthProvider: isAuthenticated (initial) ->", authenticated);
        setIsAuthenticated(authenticated);
        if (authenticated) {
          const currentUser = await authService.getCurrentUser();
          console.log("AuthProvider: getCurrentUser (initial) ->", currentUser);
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("AuthProvider: Erreur lors de la vérification de l'état d'auth initial", e);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log("AuthProvider: Vérification initiale de l'état d'auth terminée.");
      }
    };
    checkAuthState();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    console.log("AuthProvider: Tentative de connexion...");
    // setIsLoading(true); // Peut être activé si vous voulez un indicateur de chargement global pendant la connexion
    try {
      const response = await authService.login(credentials);
      if (response && response.data) {
        // Assurer que l'objet utilisateur a bien la propriété 'id'
        // L'API renvoie id_user, authService le mappe déjà sur 'id' dans currentUserData
        // et dans la valeur retournée par getCurrentUser.
        // La réponse directe de login pourrait nécessiter un mappage ici si ce n'est pas déjà fait.
        // authService.login stocke déjà l'utilisateur avec la bonne structure (id au lieu de id_user)
        const loggedInUser = await authService.getCurrentUser(); // Récupérer l'utilisateur formaté par authService
        setUser(loggedInUser); 
        setIsAuthenticated(true);
        console.log("AuthProvider: Connexion réussie, utilisateur:", loggedInUser);
      } else {
        // Ce cas ne devrait pas arriver si authService.login lève une erreur en cas d'échec
        throw new Error("Réponse de connexion invalide ou vide");
      }
      // setIsLoading(false);
    } catch (error) {
      console.error("AuthProvider: Erreur de connexion", error);
      setIsAuthenticated(false);
      setUser(null);
      // setIsLoading(false);
      throw error; 
    }
  };

  const logout = async () => {
    console.log("AuthProvider: Tentative de déconnexion...");
    // setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      console.log("AuthProvider: Déconnexion réussie.");
      // setIsLoading(false);
    } catch (error) {
      console.error("AuthProvider: Erreur de déconnexion", error);
      // setIsLoading(false);
    }
  };

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