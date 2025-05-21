
import { Restaurant } from '@/models/Restaurant';
import { restaurantService } from '@/services/entities/restaurantService';
import { AxiosResponse } from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, user, isLoading: authIsLoading } = useAuth();

  const loadRestaurants = async (currentUserId?: string | number | null) => {
    if (!currentUserId) {
      console.log('RestaurantContext - loadRestaurants: appelé sans currentUserId, annulation.');
      setRestaurants([]);
      setSelectedRestaurant(null);
      setLoading(false);
      return;
    }

    console.log('RestaurantContext - loadRestaurants: Chargement des restaurants pour l\'utilisateur:', currentUserId);
    setLoading(true);
    setError(null);
    
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Délai d\'attente dépassé lors du chargement des restaurants'));
      }, 20000);
    });
    
    try {
      const numericUserId = typeof currentUserId === 'string' ? parseInt(currentUserId, 10) : currentUserId;

      if (isNaN(numericUserId as number) || numericUserId === null) {
        console.error('RestaurantContext - loadRestaurants: ID utilisateur invalide après conversion:', currentUserId);
        throw new Error('ID utilisateur invalide fourni à loadRestaurants');
      }

      const response = await Promise.race([
        restaurantService.getByUserId(numericUserId as number), 
        timeoutPromise
      ]) as AxiosResponse<Restaurant[]>;
      
      console.log('RestaurantContext - loadRestaurants: Réponse API restaurants:', response.data);
      const userRestaurants = response.data;
      
      if (Array.isArray(userRestaurants)) {
        console.log('RestaurantContext - loadRestaurants: Restaurants chargés:', userRestaurants.length);
        setRestaurants(userRestaurants);
        
        if (userRestaurants.length > 0) {
          const currentSelectedStillExists = selectedRestaurant && userRestaurants.some(r => r.id_restaurant === selectedRestaurant.id_restaurant);
          if (currentSelectedStillExists) {
            console.log('RestaurantContext - loadRestaurants: Restaurant sélectionné actuel existe toujours:', selectedRestaurant?.nom_restaurant);
          } else {
            console.log('RestaurantContext - loadRestaurants: Sélection du restaurant par défaut:', userRestaurants[0].nom_restaurant);
            setSelectedRestaurant(userRestaurants[0]);
          }
        } else {
          console.log('RestaurantContext - loadRestaurants: Aucun restaurant disponible pour cet utilisateur.');
          setSelectedRestaurant(null);
        }
      } else {
        console.error('RestaurantContext - loadRestaurants: Format de réponse invalide pour les restaurants:', userRestaurants);
        throw new Error('Format de réponse invalide pour les restaurants');
      }
    } catch (apiError) {
      console.error('RestaurantContext - loadRestaurants: Erreur API lors du chargement des restaurants:', apiError);
      const errorMessage = apiError instanceof Error 
        ? apiError.message 
        : 'Erreur lors du chargement des restaurants';
      setError(errorMessage);
      setRestaurants([]);
      setSelectedRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const attemptInitialLoadOrReset = async () => {
      if (authIsLoading) {
        console.log('RestaurantContext (useEffect): Attente de la résolution de l\'état d\'authentification...');
        return;
      }

      if (isAuthenticated && user && user.id) {
        console.log('RestaurantContext (useEffect via useAuth): Utilisateur authentifié avec ID:', user.id, '. Chargement des restaurants.');
        await loadRestaurants(user.id);
      } else {
        console.log('RestaurantContext (useEffect via useAuth): Utilisateur non authentifié ou ID manquant. Réinitialisation.');
        setRestaurants([]);
        setSelectedRestaurant(null);
        setError(null); 
        setLoading(false);
      }
    };

    attemptInitialLoadOrReset();

  }, [isAuthenticated, user, authIsLoading]);

  const refreshRestaurants = async () => {
    console.log("RestaurantContext - refreshRestaurants: appelé manuellement (via useAuth).");
    if (authIsLoading) {
        console.log("RestaurantContext - refreshRestaurants: Attente de l'initialisation de l'auth pour le refresh.");
        return;
    }

    if (isAuthenticated && user && user.id) {
        await loadRestaurants(user.id);
    } else {
        console.error("RestaurantContext - refreshRestaurants: Impossible de rafraîchir, utilisateur non authentifié ou ID manquant.");
        setError("Impossible de rafraîchir : utilisateur non authentifié ou ID manquant (via useAuth).");
        setRestaurants([]);
        setSelectedRestaurant(null);
        setLoading(false);
    }
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        selectedRestaurant,
        setSelectedRestaurant,
        loading,
        error,
        refreshRestaurants 
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