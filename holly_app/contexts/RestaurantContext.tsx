import React, { createContext, useContext, useState, useEffect } from 'react';
import { Restaurant } from '@/src/models';
import { restaurantService, authService } from '@/src/services';

interface RestaurantContextType {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant) => void;
  loading: boolean;
  error: string | null;
  refreshRestaurants: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [authState, setAuthState] = useState<number>(0); // Pour forcer le rechargement

  const loadRestaurants = async () => {
    console.log('Chargement des restaurants...');
    setLoading(true);
    setError(null);
    
    try {
      // Vérifier d'abord l'authentification
      const isAuthenticated = await authService.isAuthenticated();
      console.log('État de l\'authentification:', isAuthenticated);
      
      if (!isAuthenticated) {
        console.log('Utilisateur non authentifié');
        setRestaurants([]);
        setSelectedRestaurant(null);
        setError(null);
        setLoading(false);
        setIsAuthChecked(true);
        return;
      }

      const currentUser = await authService.getCurrentUser();
      console.log('Données utilisateur:', currentUser);
      
      if (!currentUser) {
        console.log('Pas de données utilisateur');
        setRestaurants([]);
        setSelectedRestaurant(null);
        setError(null);
        setLoading(false);
        setIsAuthChecked(true);
        return;
      }
      
      console.log('Chargement des restaurants pour l\'utilisateur:', currentUser.id);
      const response = await restaurantService.getByUserId(currentUser.id);
      const userRestaurants = response.data;
      
      if (Array.isArray(userRestaurants)) {
        console.log('Restaurants chargés:', userRestaurants.length);
        setRestaurants(userRestaurants);
        
        // Ne sélectionner le premier restaurant que si aucun n'est déjà sélectionné
        if (userRestaurants.length > 0 && !selectedRestaurant) {
          console.log('Sélection du restaurant par défaut:', userRestaurants[0].nom_restaurant);
          setSelectedRestaurant(userRestaurants[0]);
        } else if (userRestaurants.length > 0 && selectedRestaurant) {
          // Vérifier si le restaurant sélectionné existe toujours dans la liste
          const restaurantStillExists = userRestaurants.some(
            r => r.id_restaurant === selectedRestaurant.id_restaurant
          );
          if (!restaurantStillExists) {
            console.log('Le restaurant sélectionné n\'existe plus, sélection du premier restaurant');
            setSelectedRestaurant(userRestaurants[0]);
          }
        } else {
          console.log('Aucun restaurant disponible');
          setSelectedRestaurant(null);
        }
      } else {
        console.error('Format de réponse invalide:', userRestaurants);
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des restaurants:', err);
      setError("Erreur lors du chargement des restaurants");
      setRestaurants([]);
      setSelectedRestaurant(null);
    } finally {
      setLoading(false);
      setIsAuthChecked(true);
    }
  };

  // Effet pour charger les restaurants au montage
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Effet pour recharger les restaurants quand l'authentification change
  useEffect(() => {
    const checkAuthAndReload = async () => {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        console.log('Authentification détectée, rechargement des restaurants');
        await loadRestaurants();
      }
    };

    // Vérifier l'authentification toutes les 2 secondes pendant les 10 premières secondes après le montage
    const interval = setInterval(checkAuthAndReload, 2000);
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Ne pas afficher le contenu tant que l'authentification n'est pas vérifiée
  if (!isAuthChecked) {
    return null;
  }

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        selectedRestaurant,
        setSelectedRestaurant,
        loading,
        error,
        refreshRestaurants: loadRestaurants
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurants doit être utilisé à l\'intérieur d\'un RestaurantProvider');
  }
  return context;
} 