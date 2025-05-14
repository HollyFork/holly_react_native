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

  const loadRestaurants = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Vérifier d'abord l'authentification
      const isAuthenticated = await authService.isAuthenticated();
      if (!isAuthenticated) {
        setError(null); // Ne pas afficher d'erreur si non authentifié
        setLoading(false);
        return;
      }

      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        setError(null); // Ne pas afficher d'erreur si pas d'utilisateur
        setLoading(false);
        return;
      }
      
      const response = await restaurantService.getByUserId(currentUser.id);
      const userRestaurants = response.data;
      
      if (Array.isArray(userRestaurants)) {
        setRestaurants(userRestaurants);
        
        // Ne sélectionne le premier restaurant que si aucun n'est sélectionné
        if (userRestaurants.length > 0 && !selectedRestaurant) {
          setSelectedRestaurant(userRestaurants[0]);
        }
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des restaurants:', err);
      setError("Erreur lors du chargement des restaurants");
    } finally {
      setLoading(false);
      setIsAuthChecked(true);
    }
  };

  useEffect(() => {
    loadRestaurants();
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