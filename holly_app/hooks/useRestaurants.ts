import { useState, useEffect } from 'react';
import { Restaurant } from '@/src/models';
import { restaurantService, authService } from '@/src/services';

interface UseRestaurantsResult {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant) => void;
  refreshRestaurants: () => Promise<void>;
}

/**
 * Hook personnalisé pour récupérer et gérer les restaurants de l'utilisateur connecté
 */
export function useRestaurants(): UseRestaurantsResult {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les restaurants
  const loadRestaurants = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Récupère l'utilisateur connecté
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        setError("Vous n'êtes pas connecté.");
        setLoading(false);
        return;
      }
      
      // Récupère les restaurants de l'utilisateur
      const response = await restaurantService.getByUserId(currentUser.id);
      const userRestaurants = response.data;
      
      setRestaurants(userRestaurants);
      
      // Sélectionne automatiquement le premier restaurant si aucun n'est encore sélectionné
      if (userRestaurants.length > 0 && !selectedRestaurant) {
        setSelectedRestaurant(userRestaurants[0]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des restaurants:', err);
      setError("Erreur lors du chargement des restaurants");
    } finally {
      setLoading(false);
    }
  };

  // Charge les restaurants lors du montage du composant
  useEffect(() => {
    loadRestaurants();
  }, []);

  return {
    restaurants,
    loading,
    error,
    selectedRestaurant,
    setSelectedRestaurant,
    refreshRestaurants: loadRestaurants
  };
} 